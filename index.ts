export { 
  searchDuckDuckGo, 
  searchWithValidation
} from './routes/search';

export { 
  submitForm, 
  submitFormWithRetry 
} from './routes/submit';

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