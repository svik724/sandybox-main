import { searchDuckDuckGo, searchWithValidation } from '../routes/search';

describe('Search API Integration', () => {

  it('should return properly typed search results', async () => {
    const result = await searchDuckDuckGo('test');
    
    expect('error' in result).toBe(false);
    
    if ('error' in result) {
      throw new Error('Expected successful result');
    }
    
    expect(result).toHaveProperty('Abstract');
    expect(result).toHaveProperty('AbstractSource');
    expect(result).toHaveProperty('AbstractText');
    expect(result).toHaveProperty('AbstractURL');
    expect(result).toHaveProperty('Heading');
    expect(result).toHaveProperty('Type');
    expect(result).toHaveProperty('meta');
    
    expect(typeof result.Abstract).toBe('string');
    expect(typeof result.AbstractSource).toBe('string');
    expect(typeof result.Heading).toBe('string');
    expect(typeof result.Type).toBe('string');
    expect(typeof result.meta).toBe('object');
    
    expect(result.meta).toHaveProperty('name');
    expect(result.meta).toHaveProperty('description');
    expect(result.meta).toHaveProperty('id');
  }, 30000);

  it('should handle invalid search queries', async () => {
    const emptyResult = await searchDuckDuckGo('');
    expect('error' in emptyResult).toBe(true);
    
    if ('error' in emptyResult) {
      expect(emptyResult.error).toBe('INVALID_QUERY');
      expect(emptyResult.statusCode).toBe(400);
      expect(emptyResult.message).toContain('non-empty string');
    }
    
    const nullResult = await searchDuckDuckGo(null as any);
    expect('error' in nullResult).toBe(true);
    
    if ('error' in nullResult) {
      expect(nullResult.error).toBe('INVALID_QUERY');
      expect(nullResult.statusCode).toBe(400);
    }
  });

  it('should validate and sanitize input properly', async () => {
    const longQuery = 'a'.repeat(201);
    const result = await searchWithValidation(longQuery);
    
    expect('error' in result).toBe(true);
    
    if ('error' in result) {
      expect(result.error).toBe('QUERY_TOO_LONG');
      expect(result.statusCode).toBe(400);
      expect(result.message).toContain('200 characters');
    }
  });



  it('should handle network errors gracefully', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    try {
      const result = await searchDuckDuckGo('test');
      expect('error' in result).toBe(true);
      
      if ('error' in result) {
        expect(result.error).toBe('NETWORK_ERROR');
        expect(result.statusCode).toBe(500);
        expect(result.message).toContain('Network error');
      }
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should handle API error responses', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    } as Response);
    
    try {
      const result = await searchDuckDuckGo('test');
      expect('error' in result).toBe(true);
      
      if ('error' in result) {
        expect(result.error).toBe('API_ERROR');
        expect(result.statusCode).toBe(429);
        expect(result.message).toContain('Too Many Requests');
      }
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should validate response structure matches defined types', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null)
    } as Response);
    
    try {
      const result = await searchDuckDuckGo('test');
      expect('error' in result).toBe(true);
      
      if ('error' in result) {
        expect(result.error).toBe('INVALID_RESPONSE');
        expect(result.statusCode).toBe(500);
      }
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('should handle different types of search queries', async () => {
    const queries = ['javascript', 'python', 'typescript', 'react'];
    
    for (const query of queries) {
      const result = await searchDuckDuckGo(query);
      
      expect('error' in result).toBe(false);
      
      if ('error' in result) {
        throw new Error(`Query "${query}" failed: ${result.message}`);
      }
      
      expect(result).toHaveProperty('Heading');
      expect(result).toHaveProperty('Type');
    }
  }, 60000);
});