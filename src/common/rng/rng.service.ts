import { Injectable } from '@nestjs/common';

/** Single source of randomness so games stay deterministic in tests. */
@Injectable()
export class RngService {
  /** Random integer in [0, maxExclusive). */
  int(maxExclusive: number): number {
    return Math.floor(Math.random() * maxExclusive);
  }

  /** Picks one entry, favouring the ones with a higher `weight`. */
  pickWeighted<T>(entries: readonly T[], weightOf: (entry: T) => number): T {
    const total = entries.reduce((sum, entry) => sum + weightOf(entry), 0);
    let roll = Math.random() * total;
    for (const entry of entries) {
      roll -= weightOf(entry);
      if (roll <= 0) return entry;
    }
    return entries[entries.length - 1];
  }
}
