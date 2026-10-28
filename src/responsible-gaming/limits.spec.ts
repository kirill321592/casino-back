import { UsersService } from '../users/users.service';
import { COOLING_OFF_MS, defaultLimits, requestDailyLossLimit, settlePending } from './limits';

const NOW = new Date('2026-10-28T12:00:00Z');

describe('requestDailyLossLimit', () => {
  it('applies a first limit at once', () => {
    const limits = requestDailyLossLimit(defaultLimits(), 100, NOW);
    expect(limits.dailyLossLimit).toBe(100);
    expect(limits.pendingDailyLossLimit).toBeNull();
  });

  it('applies a tighter limit at once and drops a pending looser one', () => {
    const loosening = requestDailyLossLimit({ ...defaultLimits(), dailyLossLimit: 100 }, 500, NOW);
    const limits = requestDailyLossLimit(loosening, 50, NOW);
    expect(limits.dailyLossLimit).toBe(50);
    expect(limits.pendingDailyLossLimit).toBeNull();
  });

  it('holds a looser limit back for the cooling-off period', () => {
    const limits = requestDailyLossLimit({ ...defaultLimits(), dailyLossLimit: 100 }, 500, NOW);
    expect(limits.dailyLossLimit).toBe(100);
    expect(limits.pendingDailyLossLimit).toEqual({
      amount: 500,
      effectiveAt: new Date(NOW.getTime() + COOLING_OFF_MS).toISOString(),
    });
  });

  it('treats removing a limit as loosening it', () => {
    const limits = requestDailyLossLimit({ ...defaultLimits(), dailyLossLimit: 100 }, null, NOW);
    expect(limits.dailyLossLimit).toBe(100);
    expect(limits.pendingDailyLossLimit?.amount).toBeNull();
  });
});

describe('settlePending', () => {
  const pending = requestDailyLossLimit({ ...defaultLimits(), dailyLossLimit: 100 }, 500, NOW);

  it('keeps the old limit until the cooling-off ends', () => {
    const later = new Date(NOW.getTime() + COOLING_OFF_MS - 1);
    expect(settlePending(pending, later).dailyLossLimit).toBe(100);
  });

  it('switches to the new limit once it has', () => {
    const later = new Date(NOW.getTime() + COOLING_OFF_MS);
    const limits = settlePending(pending, later);
    expect(limits.dailyLossLimit).toBe(500);
    expect(limits.pendingDailyLossLimit).toBeNull();
  });
});

describe('UsersService limits', () => {
  let users: UsersService;
  let id: string;

  beforeEach(() => {
    users = new UsersService();
    id = users.create('ada', 'hash', 'test').id;
    users.setLimits(id, { ...defaultLimits(), dailyLossLimit: 100 });
  });

  it('refuses a stake that would pass the daily loss limit', () => {
    users.debit(id, 80);
    expect(() => users.debit(id, 30)).toThrow(/daily loss limit of \$100/);
  });

  it('counts winnings against the loss', () => {
    users.debit(id, 80);
    users.credit(id, 50);
    expect(users.getLossToday(id)).toBe(30);
    expect(() => users.debit(id, 70)).not.toThrow();
  });

  it('refuses every stake during a self-exclusion', () => {
    users.selfExclude(id, new Date(Date.now() + 60_000));
    expect(() => users.debit(id, 1)).toThrow(/taken a break/);
  });

  it('never shortens a running self-exclusion', () => {
    const long = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    users.selfExclude(id, long);
    users.selfExclude(id, new Date(Date.now() + 60_000));
    expect(users.findById(id)?.selfExcludedUntil).toBe(long.toISOString());
  });
});
