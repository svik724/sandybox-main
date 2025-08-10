export interface DuckDuckGoSearchRequest {
  q: string;
  format?: 'json' | 'xml';
  no_html?: 0 | 1;
}

export interface DuckDuckGoIcon {
  Height: string;
  URL: string;
  Width: string;
}

export interface DuckDuckGoRelatedTopic {
  FirstURL: string;
  Icon: DuckDuckGoIcon;
  Result: string;
  Text: string;
}

export interface DuckDuckGoSeeAlsoSection {
  Name: string;
  Topics: DuckDuckGoRelatedTopic[];
}

// some queries will return both types - number of each is not consistent
export type DuckDuckGoRelatedTopicsItem = DuckDuckGoRelatedTopic | DuckDuckGoSeeAlsoSection;

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
  Infobox: string;
  Redirect: string;
  RelatedTopics: DuckDuckGoRelatedTopicsItem[];
  Results: any[];
  Type: string;
  meta: DuckDuckGoMeta;
}

export interface SearchError {
  error: string;
  message: string;
  statusCode: number;
}

export type SearchResult = DuckDuckGoSearchResponse | SearchError;