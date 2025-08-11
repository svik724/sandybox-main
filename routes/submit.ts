import { chromium, Browser, Page } from 'playwright';
import { 
  HttpbinFormData, 
  HttpbinFormRequest, 
  HttpbinFormResponse, 
  FormSubmissionError, 
  FormSubmissionResult,
  FormValidationResult 
} from '../types/submit.types';

export async function submitForm(request: HttpbinFormRequest): Promise<FormSubmissionResult> {
  let browser: Browser | null = null;
  
  try {
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

    browser = await chromium.launch({
      headless: true,
      timeout: request.options?.timeout || 30000
    });

    const page = await browser.newPage();
    
    await page.goto('https://httpbin.org/forms/post', {
      waitUntil: 'networkidle',
      timeout: request.options?.timeout || 30000
    });

    await fillFormFields(page, request.formData);

    const response = await submitFormAndWait(page);

    const formResponse: HttpbinFormResponse = {
      success: true,
      data: {
        form: response.form || {},
        files: response.files || {},
        url: response.url || '',
        origin: response.origin || '',
        method: 'POST',
        headers: response.headers || {}
      },
      timestamp: new Date().toISOString(),
      statusCode: 200
    };

    return formResponse;

  } catch (error) {
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
    if (browser) {
      await browser.close();
    }
  }
}

async function fillFormFields(page: Page, formData: HttpbinFormData): Promise<void> {
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

  if (formData.size) {
    await page.check(`input[name="size"][value="${formData.size}"]`);
  }

  if (formData.topping && formData.topping.length > 0) {
    for (const topping of formData.topping) {
      await page.check(`input[name="topping"][value="${topping}"]`);
    }
  }

  if (formData.delivery) {
    await page.fill('input[name="delivery"]', formData.delivery);
  }
}

async function submitFormAndWait(page: Page): Promise<any> {
  await page.click('button:has-text("Submit order")');
  
  await page.waitForLoadState('networkidle');
  
  const responseData = await page.evaluate(() => {
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

function validateFormData(formData: HttpbinFormData): FormValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};

  if (formData.custname && formData.custname.length > 100) {
    const error = 'Customer name must be less than 100 characters';
    errors.push(error);
    fieldErrors.custname = [error];
  }

  if (formData.custemail && !isValidEmail(formData.custemail)) {
    const error = 'Invalid email format';
    errors.push(error);
    fieldErrors.custemail = [error];
  }

  if (formData.custtel && !isValidPhone(formData.custtel)) {
    const error = 'Invalid phone number format';
    errors.push(error);
    fieldErrors.custtel = [error];
  }

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

export async function submitFormWithRetry(
  request: HttpbinFormRequest,
  maxRetries: number = 3
): Promise<FormSubmissionResult> {
  let lastError: FormSubmissionError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await submitForm(request);
      
      if ('error' in result) {
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
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  return lastError!;
}