// DuckDuckGo Search API Types
// Based on investigation of actual API responses

export interface DuckDuckGoSearchRequest {
  q: string; // Search query
  format?: 'json' | 'xml'; // Response format, default: json
  no_html?: 0 | 1; // Remove HTML from results, default: 0
  skip_disambig?: 0 | 1; // Skip disambiguation pages, default: 0
  t?: string; // App name for tracking
  callback?: string; // JSONP callback function
}

export interface DuckDuckGoIcon {
  Height: string;
  URL: string;
  Width: string;
}

export interface DuckDuckGoRelatedTopic {
  FirstURL: string;
  Icon: DuckDuckGoIcon;
  Result: string; // HTML result
  Text: string;
}

export interface DuckDuckGoInfoboxContent {
  data_type: string;
  label: string;
  value: string | number | object;
  wiki_order: number;
}

export interface DuckDuckGoInfoboxMeta {
  data_type: string;
  label: string;
  value: string;
}

export interface DuckDuckGoInfobox {
  content: DuckDuckGoInfoboxContent[];
  meta: DuckDuckGoInfoboxMeta[];
}

export interface DuckDuckGoMeta {
  attribution: string | null;
  blockgroup: string | null;
  created_date: string | null;
  description: string;
  designer: string | null;
  dev_date: string | null;
  dev_milestone: string;
  developer: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  example_query: string;
  id: string;
  is_stackexchange: boolean | null;
  js_callback_name: string;
  live_date: string | null;
  maintainer: {
    github: string;
  };
  name: string;
  perl_module: string;
  producer: string | null;
  production_state: string;
  repo: string;
  signal_from: string;
  src_domain: string;
  src_id: number;
  src_name: string;
  src_options: {
    directory: string;
    is_fanon: number;
    is_mediawiki: number;
    is_wikipedia: number;
    language: string;
    min_abstract_length: number;
    skip_abstract: number;
    skip_abstract_paren: number;
    skip_end: string;
    skip_icon: number;
    skip_image_name: number;
    skip_qr: string;
    source_skip: string;
    src_info: string;
  };
  src_url: string | null;
  status: string;
  tab: string;
  topic: string[];
  unsafe: number;
}

export interface DuckDuckGoSearchResponse {
  Abstract: string;
  AbstractSource: string;
  AbstractText: string;
  AbstractURL: string;
  Answer: string;
  AnswerType: string;
  Definition: string;
  DefinitionSource: string;
  DefinitionURL: string;
  Entity: string;
  Heading: string;
  Image: string;
  ImageHeight: number;
  ImageIsLogo: number;
  ImageWidth: number;
  Infobox: DuckDuckGoInfobox;
  Redirect: string;
  RelatedTopics: DuckDuckGoRelatedTopic[];
  Results: any[]; // Usually empty, structure varies
  Type: string;
  meta: DuckDuckGoMeta;
}

export interface SearchError {
  error: string;
  message: string;
  statusCode: number;
}

export type SearchResult = DuckDuckGoSearchResponse | SearchError;