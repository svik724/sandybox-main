import { searchDuckDuckGo, searchWithFiltering, searchWithValidation, submitForm } from './routes/index';
import { HttpbinFormData } from './types/submit.types';
import { DuckDuckGoRelatedTopicsItem } from './types/search.types';

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
      
      // Demo the new RelatedTopics structure
      console.log(`   Related Topics: ${searchResult.RelatedTopics.length} items`);
      
      // Show how to handle different RelatedTopics structures
      searchResult.RelatedTopics.forEach((item: DuckDuckGoRelatedTopicsItem, index: number) => {
        if ('Name' in item && item.Name === 'See also') {
          console.log(`     ${index + 1}. "See also" section with ${item.Topics.length} topics`);
        } else if ('Text' in item) {
          console.log(`     ${index + 1}. ${item.Text.substring(0, 50)}...`);
        }
      });
    }
  } catch (error) {
    console.log('❌ Search error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Demo 1b: Search with Validation
  console.log('1b. ✅ Testing Search with Validation...');
  try {
    // Test with a query that would be sanitized
    const validationResult = await searchWithValidation('  <script>alert("test")</script>  ');
    
    if ('error' in validationResult) {
      console.log('❌ Validation search failed:', validationResult.message);
    } else {
      console.log('✅ Validation search successful!');
      console.log(`   Heading: ${validationResult.Heading}`);
      console.log(`   Abstract: ${validationResult.Abstract.substring(0, 100)}...`);
      console.log('   Note: XSS characters were sanitized from the query');
    }
  } catch (error) {
    console.log('❌ Validation search error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Demo 1c: Search with Filtering
  console.log('1c. 🔍 Testing Search with Filtering...');
  try {
    // Test with filtering options
    const filteringResult = await searchWithFiltering('javascript', {
      filterEmptyResults: true,
      includeImages: false
    });
    
    if ('error' in filteringResult) {
      console.log('❌ Filtering search failed:', filteringResult.message);
    } else {
      console.log('✅ Filtering search successful!');
      console.log(`   Heading: ${filteringResult.Heading}`);
      console.log(`   Abstract: ${filteringResult.Abstract.substring(0, 100)}...`);
      console.log(`   Image URL: ${filteringResult.Image || 'Filtered out'}`);
      console.log(`   Image dimensions: ${filteringResult.ImageWidth}x${filteringResult.ImageHeight} (should be 0x0)`);
      console.log('   Note: Images were filtered out as requested');
    }
  } catch (error) {
    console.log('❌ Filtering search error:', error);
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