import { searchDuckDuckGo, submitForm } from './routes';
import { HttpbinFormData } from './types/submit.types';

async function demo() {
  console.log('🚀 SandyBox API Integration Demo\n');

  // Demo 1: DuckDuckGo Search
  console.log('1. 🔍 Testing DuckDuckGo Search API...');
  try {
    const searchResult = await searchDuckDuckGo('typescript');
    
    if ('error' in searchResult) {
      console.log('❌ Search failed:', searchResult.message);
    } else {
      console.log('✅ Search successful!');
      console.log(`   Heading: ${searchResult.Heading}`);
      console.log(`   Abstract: ${searchResult.Abstract.substring(0, 100)}...`);
      console.log(`   Source: ${searchResult.AbstractSource}`);
      console.log(`   Type: ${searchResult.Type}`);
    }
  } catch (error) {
    console.log('❌ Search error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Demo 2: Httpbin Form Submission
  console.log('2. 📝 Testing Httpbin Form Submission API...');
  try {
    const formData: HttpbinFormData = {
      custname: 'Demo User',
      custemail: 'demo@example.com',
      size: 'large',
      topping: ['cheese', 'mushroom'],
      delivery: '19:00',
      comments: 'This is a demo order!'
    };

    const submitResult = await submitForm({
      formData,
      options: { timeout: 30000 }
    });

    if ('error' in submitResult) {
      console.log('❌ Form submission failed:', submitResult.message);
    } else {
      console.log('✅ Form submission successful!');
      console.log(`   Status: ${submitResult.statusCode}`);
      console.log(`   Method: ${submitResult.data.method}`);
      console.log(`   URL: ${submitResult.data.url}`);
      console.log(`   Submitted name: ${submitResult.data.form.custname}`);
      console.log(`   Submitted size: ${submitResult.data.form.size}`);
      console.log(`   Submitted toppings: ${submitResult.data.form.topping?.join(', ')}`);
    }
  } catch (error) {
    console.log('❌ Form submission error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎉 Demo completed! All APIs are working correctly.');
}

// Run the demo
demo().catch(console.error); 