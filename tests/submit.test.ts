import { submitForm, submitFormWithRetry } from '../routes/submit';
import { 
  HttpbinFormData, 
  HttpbinFormRequest, 
  FormSubmissionResult, 
  FormSubmissionError,
  HttpbinFormResponse 
} from '../types/submit.types';

describe('Submit API Integration', () => {
  // Test successful form submission
  it('should successfully submit form data', async () => {
    const formData: HttpbinFormData = {
      custname: 'John Doe',
      custtel: '1234567890',
      custemail: 'john@example.com',
      size: 'medium',
      topping: ['cheese', 'bacon'],
      delivery: '18:30',
      comments: 'Extra crispy please'
    };

    const request: HttpbinFormRequest = {
      formData,
      options: {
        timeout: 30000
      }
    };

    const result = await submitForm(request);
    
    // Should not be an error
    expect('error' in result).toBe(false);
    
    if ('error' in result) {
      throw new Error('Expected successful submission');
    }
    
    // Validate response structure
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.timestamp).toBeDefined();
    expect(result.data).toBeDefined();
    
    // Validate form data in response - httpbin returns empty strings for unfilled fields
    const expectedFormData = {
      custname: 'John Doe',
      custtel: '1234567890',
      custemail: 'john@example.com',
      size: 'medium',
      topping: ['cheese', 'bacon'],
      delivery: '18:30',
      comments: 'Extra crispy please'
    };
    
    // Check that our submitted data is present
    expect(result.data.form.custname).toBe(expectedFormData.custname);
    expect(result.data.form.custtel).toBe(expectedFormData.custtel);
    expect(result.data.form.custemail).toBe(expectedFormData.custemail);
    expect(result.data.form.size).toBe(expectedFormData.size);
    expect(result.data.form.topping).toContain(expectedFormData.topping[0]);
    expect(result.data.form.topping).toContain(expectedFormData.topping[1]);
    expect(result.data.form.delivery).toBe(expectedFormData.delivery);
    expect(result.data.form.comments).toBe(expectedFormData.comments);
    
    expect(result.data.method).toBe('POST');
    expect(result.data.url).toContain('httpbin.org');
  }, 60000);

  // Test form submission errors
  it('should handle form submission errors', async () => {
    // Test with invalid email
    const invalidFormData: HttpbinFormData = {
      custname: 'John Doe',
      custemail: 'invalid-email'
    };

    const request: HttpbinFormRequest = {
      formData: invalidFormData
    };

    const result = await submitForm(request);
    
    // Should be a validation error
    expect('error' in result).toBe(true);
    
    if ('error' in result) {
      expect(result.error).toBe('VALIDATION_ERROR');
      expect(result.statusCode).toBe(400);
      expect(result.details?.validationError).toContain('Invalid email format');
    }
  });

  // Test validation errors
  it('should validate form data before submission', async () => {
    const testCases = [
      {
        data: { custname: 'a'.repeat(101) },
        expectedError: 'Customer name must be less than 100 characters'
      },
      {
        data: { custemail: 'not-an-email' },
        expectedError: 'Invalid email format'
      },
      {
        data: { custtel: 'invalid-phone' },
        expectedError: 'Invalid phone number format'
      },
      {
        data: { delivery: '25:70' },
        expectedError: 'Invalid time format'
      }
    ];

    for (const testCase of testCases) {
      const request: HttpbinFormRequest = {
        formData: testCase.data
      };

      const result = await submitForm(request);
      
      expect('error' in result).toBe(true);
      
      if ('error' in result) {
        expect(result.error).toBe('VALIDATION_ERROR');
        expect(result.statusCode).toBe(400);
        expect(result.details?.validationError).toContain(testCase.expectedError);
      }
    }
  });

  // Test different form field types
  it('should handle different form field types correctly', async () => {
    const formData: HttpbinFormData = {
      custname: 'Jane Smith',
      size: 'large',
      topping: ['mushroom', 'onion'],
      comments: 'No cheese please'
    };

    const request: HttpbinFormRequest = {
      formData
    };

    const result = await submitForm(request);
    
    if ('error' in result) {
      throw new Error(`Form submission failed: ${result.message}`);
    }
    
    // Should have submitted the correct data
    expect(result.data.form.custname).toBe('Jane Smith');
    expect(result.data.form.size).toBe('large');
    expect(result.data.form.topping).toContain('mushroom');
    expect(result.data.form.topping).toContain('onion');
    expect(result.data.form.comments).toBe('No cheese please');
  }, 60000);

  // Test retry logic
  it('should implement retry logic for failed submissions', async () => {
    // This test would require mocking Playwright to simulate failures
    // For now, we'll test the retry function exists and has the right signature
    expect(typeof submitFormWithRetry).toBe('function');
    
    // Test with valid data to ensure retry function works
    const formData: HttpbinFormData = {
      custname: 'Test User',
      size: 'small'
    };

    const request: HttpbinFormRequest = {
      formData
    };

    const result = await submitFormWithRetry(request, 2);
    
    if ('error' in result) {
      throw new Error(`Retry submission failed: ${result.message}`);
    }
    
    expect(result.success).toBe(true);
  }, 60000);

  // Test timeout handling
  it('should handle timeout errors gracefully', async () => {
    const formData: HttpbinFormData = {
      custname: 'Timeout Test'
    };

    const request: HttpbinFormRequest = {
      formData,
      options: {
        timeout: 1 // Very short timeout to trigger error
      }
    };

    const result = await submitForm(request);
    
    // Should handle timeout gracefully
    expect('error' in result).toBe(true);
    
    if ('error' in result) {
      expect(result.error).toBe('SUBMISSION_ERROR');
      expect(result.statusCode).toBe(500);
    }
  }, 10000);

  // Test empty form submission
  it('should handle empty form data', async () => {
    const request: HttpbinFormRequest = {
      formData: {}
    };

    const result = await submitForm(request);
    
    // Should succeed with empty form
    expect('error' in result).toBe(false);
    
    if ('error' in result) {
      throw new Error('Expected successful submission with empty form');
    }
    
    expect(result.success).toBe(true);
    // httpbin returns empty strings for unfilled fields, not undefined
    expect(result.data.form.custname).toBe('');
    expect(result.data.form.custtel).toBe('');
    expect(result.data.form.custemail).toBe('');
    expect(result.data.form.delivery).toBe('');
    expect(result.data.form.comments).toBe('');
  }, 60000);

  // Test partial form data
  it('should handle partial form data correctly', async () => {
    const partialData: HttpbinFormData = {
      custname: 'Partial User',
      size: 'medium'
      // Missing other fields intentionally
    };

    const request: HttpbinFormRequest = {
      formData: partialData
    };

    const result = await submitForm(request);
    
    if ('error' in result) {
      throw new Error(`Partial form submission failed: ${result.message}`);
    }
    
    // Should only submit the provided fields
    expect(result.data.form.custname).toBe('Partial User');
    expect(result.data.form.size).toBe('medium');
    // httpbin returns empty strings for unfilled fields, not undefined
    expect(result.data.form.custtel).toBe('');
    expect(result.data.form.custemail).toBe('');
  }, 60000);

  // Test response structure validation
  it('should validate response structure matches defined types', async () => {
    const formData: HttpbinFormData = {
      custname: 'Structure Test'
    };

    const request: HttpbinFormRequest = {
      formData
    };

    const result = await submitForm(request);
    
    if ('error' in result) {
      throw new Error(`Structure test failed: ${result.message}`);
    }
    
    // Validate all required properties exist
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('statusCode');
    
    expect(result.data).toHaveProperty('form');
    expect(result.data).toHaveProperty('method');
    expect(result.data).toHaveProperty('url');
    expect(result.data).toHaveProperty('origin');
    expect(result.data).toHaveProperty('headers');
    
    // Validate types
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.timestamp).toBe('string');
    expect(typeof result.statusCode).toBe('number');
    expect(typeof result.data.method).toBe('string');
    expect(typeof result.data.url).toBe('string');
  }, 60000);
});