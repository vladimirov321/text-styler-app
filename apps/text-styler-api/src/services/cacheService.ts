import NodeCache from 'node-cache';

export class CacheService {
  private cache: NodeCache;
  
  constructor(options: {
    ttl?: number;
    checkPeriod?: number;
    maxKeys?: number;
  } = {}) {
    this.cache = new NodeCache({
      stdTTL: options.ttl || 3600,
      checkperiod: options.checkPeriod || 600,
      maxKeys: options.maxKeys || 1000
    });
  }
  
  public get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }
  
  public set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl !== undefined) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }
  
  public del(key: string): number {
    return this.cache.del(key);
  }
  
  public flush(): void {
    this.cache.flushAll();
  }
}
