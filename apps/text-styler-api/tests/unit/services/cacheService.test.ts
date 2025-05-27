import { expect } from 'chai';
import { CacheService } from '../../../src/services/cacheService';

describe('Unit Tests - CacheService', () => {
  let cacheService: CacheService;
  
  beforeEach(() => {
    cacheService = new CacheService({ ttl: 100, checkPeriod: 120 });
  });
  
  describe('set and get', () => {
    it('should store and retrieve values correctly', () => {
      const key = 'testKey';
      const value = 'testValue';
      
      cacheService.set(key, value);
      const result = cacheService.get<string>(key);
      
      expect(result).to.equal(value);
    });
    
    it('should return undefined for non-existent keys', () => {
      const result = cacheService.get<string>('nonExistentKey');
      expect(result).to.be.undefined;
    });
    
    it('should support custom TTL when setting values', () => {
      const key = 'customTtlKey';
      const value = 'customTtlValue';
      
      cacheService.set(key, value, 1);
      
      expect(cacheService.get<string>(key)).to.equal(value);
      
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cacheService.get<string>(key)).to.be.undefined;
          resolve(true);
        }, 1100);
      });
    });
  });
  
  describe('del', () => {
    it('should delete cached items', () => {
      const key = 'deleteKey';
      const value = 'deleteValue';
      
      cacheService.set(key, value);
      expect(cacheService.get<string>(key)).to.equal(value);
      
      cacheService.del(key);
      expect(cacheService.get<string>(key)).to.be.undefined;
    });
    
    it('should return 1 when deleting an existing key', () => {
      const key = 'existingKey';
      cacheService.set(key, 'value');
      
      const result = cacheService.del(key);
      
      expect(result).to.equal(1);
    });
    
    it('should return 0 when deleting a non-existent key', () => {
      const result = cacheService.del('nonExistentKey');
      
      expect(result).to.equal(0);
    });
  });
  
  describe('flush', () => {
    it('should remove all cached items', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      cacheService.flush();
      
      expect(cacheService.get<string>('key1')).to.be.undefined;
      expect(cacheService.get<string>('key2')).to.be.undefined;
    });
  });
});
