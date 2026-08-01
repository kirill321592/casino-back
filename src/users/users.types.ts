export interface User {
  id: string;
  username: string;
  /** scrypt digest, never leaves the server. */
  passwordHash: string;
  balance: number;
  createdAt: string;
}

/** The shape the client is allowed to see. */
export interface UserProfile {
  id: string;
  username: string;
  balance: number;
}
