export interface HttpbinFormField {
  name: string;
  type: 'text' | 'tel' | 'email' | 'radio' | 'checkbox' | 'time';
  required: boolean;
  placeholder: string | null;
  value: string | null;
}

export interface HttpbinFormData {
  custname?: string;
  custtel?: string;
  custemail?: string;
  size?: 'small' | 'medium' | 'large';
  topping?: string[];
  delivery?: string;
  comments?: string;
}

export interface HttpbinFormRequest {
  formData: HttpbinFormData;
  options?: {
    timeout?: number;
    retries?: number;
  };
}

export interface HttpbinFormResponse {
  success: boolean;
  data: {
    form: HttpbinFormData;
    files: Record<string, string>;
    url: string;
    origin: string;
    method: string;
    headers: Record<string, string>;
  };
  timestamp: string;
  statusCode: number;
}

export interface FormSubmissionError {
  error: string;
  message: string;
  statusCode: number;
  details?: {
    field?: string;
    validationError?: string;
    networkError?: string;
  };
}

export type FormSubmissionResult = HttpbinFormResponse | FormSubmissionError;

export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string[]>;
}

export interface FormFieldConfig {
  name: keyof HttpbinFormData;
  label: string;
  type: HttpbinFormField['type'];
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
}