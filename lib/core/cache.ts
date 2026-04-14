export class CacheTTL {
  private fetchedAt: number | null = null;
  private ttl: number;

  constructor(ttlMs: number) {
    this.ttl = ttlMs;
  }

  isValid(): boolean {
    if (this.ttl === 0 || this.fetchedAt === null) return false;
    return Date.now() - this.fetchedAt < this.ttl;
  }

  touch(): void {
    this.fetchedAt = Date.now();
  }

  invalidate(): void {
    this.fetchedAt = null;
  }
}
