import { DuckDuckGoSearchRequest, DuckDuckGoSearchResponse, SearchError, SearchResult } from '../types/search.types';

export async function searchDuckDuckGo(query: string, options?: Partial<DuckDuckGoSearchRequest>): Promise<SearchResult> {
  try {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      const error: SearchError = {
        error: 'INVALID_QUERY',
        message: 'Search query must be a non-empty string',
        statusCode: 400
      };
      return error;
    }

    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      no_html: '1'
    });

    // Actual API request
    const response = await fetch(`https://api.duckduckgo.com/?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SandyBox-Integration/1.0'
      }
    });

    if (!response || !response.ok) {
      const error: SearchError = {
        error: 'API_ERROR',
        message: `DuckDuckGo API returned status ${response.status}: ${response.statusText}`,
        statusCode: response.status
      };
      return error;
    }

    const data = await response.json() as DuckDuckGoSearchResponse;
    
    if (!data || typeof data !== 'object') {
      const error: SearchError = {
        error: 'INVALID_RESPONSE',
        message: 'Invalid response format from DuckDuckGo API',
        statusCode: 500
      };
      return error;
    }

    return data;

  } catch (error) {
    const searchError: SearchError = {
      error: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Unknown network error occurred',
      statusCode: 500
    };
    return searchError;
  }
}

export async function searchWithValidation(
  query: string, 
  options?: Partial<DuckDuckGoSearchRequest>
): Promise<SearchResult> {
  
  // prevent XSS attacks - remove HTML tags
  const sanitizedQuery = query.trim().replace(/[<>]/g, '');
  
  if (sanitizedQuery.length > 200) {
    const error: SearchError = {
      error: 'QUERY_TOO_LONG',
      message: 'Search query exceeds maximum length of 200 characters',
      statusCode: 400
    };
    return error;
  }

  return searchDuckDuckGo(sanitizedQuery, options);
}

