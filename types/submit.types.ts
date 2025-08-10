// Httpbin Form Submission Types
// Based on investigation of actual form structure

export interface HttpbinFormField {
  name: string;
  type: 'text' | 'tel' | 'email' | 'radio' | 'checkbox' | 'time';
  required: boolean;
  placeholder: string | null;
  value: string | null;
}

export interface HttpbinFormData {
  custname?: string; // Customer name
  custtel?: string; // Customer telephone
  custemail?: string; // Customer email
  size?: 'small' | 'medium' | 'large'; // Pizza size
  topping?: string[]; // Pizza toppings (multiple selection) - options: bacon, cheese, onion, mushroom
  delivery?: string; // Delivery time
  comments?: string; // Additional comments
}

export interface HttpbinFormRequest {
  formData: HttpbinFormData;
  options?: {
    timeout?: number; // Request timeout in milliseconds
    retries?: number; // Number of retry attempts
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

// Form validation types
export interface FormValidationResult {
  isValid: boolean;
  errors: string[];
  fieldErrors: Record<string, string[]>;
}

// Form field configuration for UI
export interface FormFieldConfig {
  name: keyof HttpbinFormData;
  label: string;
  type: HttpbinFormField['type'];
  required: boolean;
  placeholder?: string;
  options?: string[]; // For radio/checkbox fields
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
}