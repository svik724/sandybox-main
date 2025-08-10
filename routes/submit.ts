import { chromium, Browser, Page } from 'playwright';
import { 
  HttpbinFormData, 
  HttpbinFormRequest, 
  HttpbinFormResponse, 
  FormSubmissionError, 
  FormSubmissionResult,
  FormValidationResult 
} from '../types/submit.types';

/**
 * Httpbin Form Submission API Integration
 * Uses Playwright for POST requests as required
 */
export async function submitForm(request: HttpbinFormRequest): Promise<FormSubmissionResult> {
  let browser: Browser | null = null;
  
  try {
    // Validate form data
    const validation = validateFormData(request.formData);
    if (!validation.isValid) {
      const error: FormSubmissionError = {
        error: 'VALIDATION_ERROR',
        message: 'Form data validation failed',
        statusCode: 400,
        details: {
          validationError: validation.errors.join(', ')
        }
      };
      return error;
    }

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      timeout: request.options?.timeout || 30000
    });

    const page = await browser.newPage();
    
    // Navigate to the form
    await page.goto('https://httpbin.org/forms/post', {
      waitUntil: 'networkidle',
      timeout: request.options?.timeout || 30000
    });

    // Fill form fields
    await fillFormFields(page, request.formData);

    // Submit the form
    const response = await submitFormAndWait(page);

    // Extract response data - httpbin.org returns the actual API response
    const formResponse: HttpbinFormResponse = {
      success: true,
      data: {
        form: response.form || {},
        files: response.files || {},
        url: response.url || '',
        origin: response.origin || '',
        method: 'POST', // We know it's POST since we're submitting a form
        headers: response.headers || {}
      },
      timestamp: new Date().toISOString(),
      statusCode: 200
    };

    return formResponse;

  } catch (error) {
    // Handle various error scenarios
    const submissionError: FormSubmissionError = {
      error: 'SUBMISSION_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred during form submission',
      statusCode: 500,
      details: {
        networkError: error instanceof Error && error.message.includes('timeout') ? 'Request timeout' : undefined
      }
    };
    return submissionError;

  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Fill form fields with the provided data
 */
async function fillFormFields(page: Page, formData: HttpbinFormData): Promise<void> {
  // Fill text fields
  if (formData.custname) {
    await page.fill('input[name="custname"]', formData.custname);
  }
  
  if (formData.custtel) {
    await page.fill('input[name="custtel"]', formData.custtel);
  }
  
  if (formData.custemail) {
    await page.fill('input[name="custemail"]', formData.custemail);
  }
  
  if (formData.comments) {
    await page.fill('textarea[name="comments"]', formData.comments);
  }

  // Handle radio button selection
  if (formData.size) {
    await page.check(`input[name="size"][value="${formData.size}"]`);
  }

  // Handle checkbox selections
  if (formData.topping && formData.topping.length > 0) {
    for (const topping of formData.topping) {
      await page.check(`input[name="topping"][value="${topping}"]`);
    }
  }

  // Handle time field
  if (formData.delivery) {
    await page.fill('input[name="delivery"]', formData.delivery);
  }
}

/**
 * Submit the form and wait for response
 */
async function submitFormAndWait(page: Page): Promise<any> {
  // Submit the form - the submit button is a <button> element, not input[type="submit"]
  await page.click('button:has-text("Submit order")');
  
  // Wait for the response page to load
  await page.waitForLoadState('networkidle');
  
  // Extract the response data from the page
  const responseData = await page.evaluate(() => {
    // The response page shows the submitted data
    const formDataElement = document.querySelector('pre');
    if (formDataElement) {
      try {
        return JSON.parse(formDataElement.textContent || '{}');
      } catch {
        return {};
      }
    }
    return {};
  });

  return responseData;
}

/**
 * Validate form data before submission
 */
function validateFormData(formData: HttpbinFormData): FormValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};

  // Validate customer name
  if (formData.custname && formData.custname.length > 100) {
    const error = 'Customer name must be less than 100 characters';
    errors.push(error);
    fieldErrors.custname = [error];
  }

  // Validate email format
  if (formData.custemail && !isValidEmail(formData.custemail)) {
    const error = 'Invalid email format';
    errors.push(error);
    fieldErrors.custemail = [error];
  }

  // Validate phone number
  if (formData.custtel && !isValidPhone(formData.custtel)) {
    const error = 'Invalid phone number format';
    errors.push(error);
    fieldErrors.custtel = [error];
  }

  // Validate delivery time
  if (formData.delivery && !isValidTime(formData.delivery)) {
    const error = 'Invalid time format (use HH:MM)';
    errors.push(error);
    fieldErrors.delivery = [error];
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
}

/**
 * Utility functions for validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function isValidTime(time: string): boolean {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Enhanced form submission with retry logic
 */
export async function submitFormWithRetry(
  request: HttpbinFormRequest,
  maxRetries: number = 3
): Promise<FormSubmissionResult> {
  let lastError: FormSubmissionError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await submitForm(request);
      
      if ('error' in result) {
        // If it's a validation error, don't retry
        if (result.statusCode === 400) {
          return result;
        }
        lastError = result;
        continue;
      }
      
      return result;
      
    } catch (error) {
      lastError = {
        error: 'RETRY_ERROR',
        message: `Attempt ${attempt} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        statusCode: 500
      };
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  return lastError!;
}