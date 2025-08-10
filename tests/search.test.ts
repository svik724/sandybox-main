import { searchDuckDuckGo, searchWithValidation, searchWithFiltering } from '../routes/search';
import { SearchResult, SearchError, DuckDuckGoSearchResponse } from '../types/search.types';

describe('Search API Integration', () => {
  // Test successful search
  it('should return properly typed search results', async () => {
    const result = await searchDuckDuckGo('test');
    
    // Should not be an error
    expect('error' in result).toBe(false);
    
    if ('error' in result) {
      throw new Error('Expected successful result');
    }
    
    // Validate response structure
    expect(result).toHaveProperty('Abstract');
    expect(result).toHaveProperty('AbstractSource');
    expect(result).toHaveProperty('AbstractText');
    expect(result).toHaveProperty('AbstractURL');
    expect(result).toHaveProperty('Heading');
    expect(result).toHaveProperty('Type');
    expect(result).toHaveProperty('meta');
    
    // Validate types
    expect(typeof result.Abstract).toBe('string');
    expect(typeof result.AbstractSource).toBe('string');
    expect(typeof result.Heading).toBe('string');
    expect(typeof result.Type).toBe('string');
    expect(typeof result.meta).toBe('object');
    
    // Validate meta structure
    expect(result.meta).toHaveProperty('name');
    expect(result.meta).toHaveProperty('description');
    expect(result.meta).toHaveProperty('id');
  }, 30000);

  // Test error handling for invalid queries
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

  // Test enhanced validation
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

  // Test filtering options
  it('should handle filtering options correctly', async () => {
    const result = await searchWithFiltering('test', { 
      filterEmptyResults: true,
      includeImages: false 
    });
    
    if ('error' in result) {
      // If no results found, that's expected behavior
      expect(result.error).toBe('NO_RESULTS');
      return;
    }
    
    // If results found, images should be filtered out
    expect(result.Image).toBe('');
    expect(result.ImageHeight).toBe(0);
    expect(result.ImageWidth).toBe(0);
  }, 30000);

  // Test network error handling
  it('should handle network errors gracefully', async () => {
    // Mock fetch to simulate network error
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

  // Test API error responses
  it('should handle API error responses', async () => {
    // Mock fetch to simulate API error
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

  // Test response structure validation
  it('should validate response structure matches defined types', async () => {
    // Mock fetch to return invalid response
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

  // Test different search queries
  it('should handle different types of search queries', async () => {
    const queries = ['javascript', 'python', 'typescript', 'react'];
    
    for (const query of queries) {
      const result = await searchDuckDuckGo(query);
      
      // Should not be an error
      expect('error' in result).toBe(false);
      
      if ('error' in result) {
        throw new Error(`Query "${query}" failed: ${result.message}`);
      }
      
      // Should have basic structure
      expect(result).toHaveProperty('Heading');
      expect(result).toHaveProperty('Type');
    }
  }, 60000);
});