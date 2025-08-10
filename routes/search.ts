import { DuckDuckGoSearchRequest, DuckDuckGoSearchResponse, SearchError, SearchResult } from '../types/search.types';

/**
 * DuckDuckGo Search API Integration
 * Uses fetch for GET requests as required
 */
export async function searchDuckDuckGo(query: string, options?: Partial<DuckDuckGoSearchRequest>): Promise<SearchResult> {
  try {
    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      const error: SearchError = {
        error: 'INVALID_QUERY',
        message: 'Search query must be a non-empty string',
        statusCode: 400
      };
      return error;
    }

    // Build request parameters
    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      no_html: '1',
      skip_disambig: '1'
    });
    
    // Add optional parameters
    if (options?.t) params.append('t', options.t);
    if (options?.callback) params.append('callback', options.callback);

    // Make the API request
    const response = await fetch(`https://api.duckduckgo.com/?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SandyBox-Integration/1.0'
      }
    });

    if (!response.ok) {
      const error: SearchError = {
        error: 'API_ERROR',
        message: `DuckDuckGo API returned status ${response.status}: ${response.statusText}`,
        statusCode: response.status
      };
      return error;
    }

    // Parse response
    const data = await response.json() as DuckDuckGoSearchResponse;
    
    // Validate response structure
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
    // Handle network and parsing errors
    const searchError: SearchError = {
      error: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Unknown network error occurred',
      statusCode: 500
    };
    return searchError;
  }
}

/**
 * Enhanced search with additional validation and processing
 */
export async function searchWithValidation(
  query: string, 
  options?: Partial<DuckDuckGoSearchRequest>
): Promise<SearchResult> {
  // Additional input sanitization
  const sanitizedQuery = query.trim().replace(/[<>]/g, ''); // Basic XSS prevention
  
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

/**
 * Search with result filtering and enhancement
 */
export async function searchWithFiltering(
  query: string,
  options?: Partial<DuckDuckGoSearchRequest> & {
    filterEmptyResults?: boolean;
    includeImages?: boolean;
  }
): Promise<SearchResult> {
  const result = await searchDuckDuckGo(query, options);
  
  if ('error' in result) {
    return result;
  }

  // Filter out empty results if requested
  if (options?.filterEmptyResults && !result.Abstract && result.RelatedTopics.length === 0) {
    const error: SearchError = {
      error: 'NO_RESULTS',
      message: 'No results found for the given query',
      statusCode: 404
    };
    return error;
  }

  // Filter out images if not requested
  if (!options?.includeImages) {
    result.Image = '';
    result.ImageHeight = 0;
    result.ImageWidth = 0;
    result.ImageIsLogo = 0;
  }

  return result;
}