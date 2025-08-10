// Import your route functions here to verify basic connectivity.
// No need to call them — this is only for type checking and structural verification.

// Search API functions
export { 
  searchDuckDuckGo, 
  searchWithValidation, 
  searchWithFiltering 
} from './routes/search';

// Submit API functions
export { 
  submitForm, 
  submitFormWithRetry 
} from './routes/submit';

// Type exports for external use
export type {
  SearchResult,
  SearchError,
  DuckDuckGoSearchResponse,
  DuckDuckGoSearchRequest
} from './types/search.types';

export type {
  FormSubmissionResult,
  FormSubmissionError,
  HttpbinFormResponse,
  HttpbinFormRequest,
  HttpbinFormData
} from './types/submit.types';