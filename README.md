# SandyBox API Integration Project

A comprehensive demonstration of reverse-engineering undocumented APIs, implementing TypeScript types, and building production-ready backend routes. This project showcases real-world integration skills where formal API specifications don't exist.

By: Saatvik Billa | svik724@berkeley.edu

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [API Investigation Process](#api-investigation-process)
  - [DuckDuckGo Search API](#duckduckgo-search-api)
  - [Httpbin Form Submission API](#httpbin-form-submission-api)
- [Design Decisions](#design-decisions)
- [Testing Strategy](#testing-strategy)
- [Getting Started](#getting-started)

## 🏗️ Project Structure

```
sandybox-main/
├── routes/           # API integration implementations
├── types/            # TypeScript type definitions
├── tests/            # Comprehensive test suite
├── investigation/    # Sample API responses for reference
├── demo.ts           # Working demonstration
└── package.json      # Dependencies and scripts
```

## 🔍 API Investigation Process

This project demonstrates the reverse-engineering process through comprehensive documentation. The investigation process shows:

- **Systematic API exploration** using various tools (curl, browser DevTools, Playwright)
- **Methodical investigation process** from basic discovery to comprehensive understanding
- **Documentation of findings** including response structures, field types, and edge cases
- **Design rationale** for implementation choices and architecture decisions

### <span style="color: #ffcc00;">DuckDuckGo Search API</span>

#### Initial Exploration

I discovered the DuckDuckGo API through a Google search for "DuckDuckGo GET Request" and found the format: `http://api.duckduckgo.com/?q=x&format=json`. I found the easiest way to approach this would be to run curl commands in the terminal and evaluate the different JSON responses.

**Basic API Call:**
```bash
curl "https://api.duckduckgo.com/?q=typescript&format=json"
```

**Sample Response:**
```json
{
  "Abstract": "Typescript may refer to: • typescript, a manuscript that was typed rather than handwritten • Script, a Unix command for recording terminal sessions whose output is referred to as typescript • TypeScript, a programming language",
  "AbstractSource": "Wikipedia",
  "AbstractText": "Typescript may refer to: • typescript, a manuscript that was typed rather than handwritten • Script, a Unix command for recording terminal sessions whose output is referred to as typescript • TypeScript, a programming language",
  "AbstractURL": "https://en.wikipedia.org/wiki/Typescript",
  "Answer": "",
  "AnswerType": "",
  "Definition": "",
  "DefinitionSource": "",
  "DefinitionURL": "",
  "Entity": "",
  "Heading": "Typescript",
  "Image": "",
  "ImageHeight": 0,
  "ImageIsLogo": 0,
  "ImageWidth": 0,
  "Infobox": "",
  "Redirect": "",
  "RelatedTopics": [],
  "Results": [],
  "Type": "A",
  "meta": {
    "attribution": null,
    "blockgroup": null,
    "created_date": null,
    "description": "Wikipedia",
    "designer": null,
    "dev_date": null,
    "dev_milestone": "live",
    "developer": [
      {
        "name": "DDG Team",
        "type": "ddg",
        "url": "http://www.duckduckhack.com"
      }
    ],
    "example_query": "nikola tesla",
    "id": "wikipedia_fathead",
    "is_stackexchange": null,
    "js_callback_name": "wikipedia",
    "live_date": null,
    "maintainer": {
      "github": "duckduckgo"
    },
    "name": "Wikipedia",
    "perl_module": "DDG::Fathead::Wikipedia",
    "producer": null,
    "production_state": "online",
    "repo": "fathead",
    "signal_from": "wikipedia_fathead",
    "src_domain": "en.wikipedia.org",
    "src_id": 1,
    "src_name": "Wikipedia",
    "src_options": {
      "directory": "",
      "is_fanon": 0,
      "is_mediawiki": 1,
      "is_wikipedia": 1,
      "language": "en",
      "min_abstract_length": "20",
      "skip_abstract": 0,
      "skip_abstract_paren": 0,
      "skip_end": "0",
      "skip_icon": 0,
      "skip_image_name": 0,
      "skip_qr": "",
      "source_skip": "",
      "src_info": ""
    },
    "src_url": null,
    "status": "live",
    "tab": "About",
    "topic": [
      "productivity"
    ],
    "unsafe": 0
  }
}
```

#### Parameter Investigation

At this point, I knew that there were two main parameters: *q* and *format*, but I knew from previous knowledge that *no_html* is present in practically every API I've come across, so I tried it out and got a valid response as well, leading me to add it to the schema.


Basic search: 
```bash
curl "https://api.duckduckgo.com/?q=typescript&format=json"
```

With HTML removal: 
```bash
curl "https://api.duckduckgo.com/?q=typescript&format=json&no_html=1"
```

The interesting thing was when you sent an invalid response, you would just get no response back whatsoever and even a 200 HTTP status code. Hence, when implementing the API, I had to add some extra error checking where I processed the query and checked it for certain things (i.e. empty, too long, HTML tags, etc.)
```bash
curl "https://api.duckduckgo.com/?q=&format=json"
curl "https://api.duckduckgo.com/?q=$(printf 'a%.0s' {1..300})&format=json"
```

#### Key Discoveries

**Request Parameters:**
- `q` (required): Search query string
- `format`: Response format (json/xml)
- `no_html`: Remove HTML from results (0/1)

**Response Structure:**
- **Core Content**: Abstract, Heading, Type, Image
- **Metadata**: AbstractSource, AbstractURL, Answer, Definition
- **Rich Content**: Infobox as simple string (not complex nested structure)
- **Related Content**: RelatedTopics array with mixed structure
- **API Info**: Meta object with source information

**Data Types:**
- Most fields are strings
- Image dimensions are numbers
- RelatedTopics contains both standard topics and "See also" sections
- Infobox is a simple string (not nested structure)
- Meta contains complex nested objects

**RelatedTopics Structure Discovery:**
The `RelatedTopics` array contains two types of items:

1. **Standard Related Topics** (most items):
```json
{
  "FirstURL": "https://duckduckgo.com/Nikola_Tesla",
  "Icon": { "Height": "", "URL": "/i/a9c448ae.jpeg", "Width": "" },
  "Result": "<a href=\"...\">Nikola Tesla</a> A Serbian-American engineer...",
  "Text": "Nikola Tesla A Serbian-American engineer..."
}
```

2. **Additional "Topical" Section** (usually at the end of the list, but count is not deterministic):
```json
{
  "Name": "See also",
  "Topics": [
    {
      "FirstURL": "https://duckduckgo.com/Nikola_Tesla_in_popular_culture",
      "Icon": { "Height": "", "URL": "", "Width": "" },
      "Result": "<a href=\"...\">Nikola Tesla in popular culture</a>...",
      "Text": "Nikola Tesla in popular culture..."
    }
  ]
}
```

OR 

```json
{
      "Name": "Roller coasters",
      "Topics": [
        {
          "FirstURL": "https://duckduckgo.com/Python_(Efteling)",
          "Icon": {
            "Height": "",
            "URL": "/i/250a54c9.jpg",
            "Width": ""
          },
          "Result": "<a href=\"https://duckduckgo.com/Python_(Efteling)\">Python (Efteling)</a>A double-loop corkscrew roller coaster in the Efteling amusement park in the Netherlands.",
          "Text": "Python (Efteling) A double-loop corkscrew roller coaster in the Efteling amusement park in the Netherlands."
        },
        {
          "FirstURL": "https://duckduckgo.com/Python_(Busch_Gardens_Tampa_Bay)",
          "Icon": {
            "Height": "",
            "URL": "/i/30cba8e6.jpg",
            "Width": ""
          },
          "Result": "<a href=\"https://duckduckgo.com/Python_(Busch_Gardens_Tampa_Bay)\">Python (Busch Gardens Tampa Bay)</a>A steel roller coaster located at Busch Gardens Tampa Bay theme park in Tampa, Florida.",
          "Text": "Python (Busch Gardens Tampa Bay) A steel roller coaster located at Busch Gardens Tampa Bay theme park in Tampa, Florida."
        },
      ]
    },
```

**Error Responses:**
- Invalid queries return empty responses with a 200 
- Network errors need to be handled gracefully
- API rate limiting possible

### <span style="color: #ffcc00;">Httpbin Form Submission API</span>

#### Initial Exploration

**Form Discovery:**
I started by visiting the form page to understand the structure: `https://httpbin.org/forms/post`

I opened up the web inspector to view the actual HTML to identify all field types and names:

```html
<form method="post" action="/post">
  <p><label>Customer name: <input name="custname" type="text"></label></p>
  <p><label>Telephone: <input name="custtel" type="tel"></label></p>
  <p><label>E-mail address: <input name="custemail" type="email"></label></p>
  
  <fieldset>
    <legend>Pizza Size</legend>
    <p><label><input name="size" type="radio" value="small"> Small</label></p>
    <p><label><input name="size" type="radio" value="medium"> Medium</label></p>
    <p><label><input name="size" type="radio" value="large"> Large</label></p>
  </fieldset>
  
  <fieldset>
    <legend>Pizza Toppings</legend>
    <p><label><input name="topping" type="checkbox" value="bacon"> Bacon</label></p>
    <p><label><input name="topping" type="checkbox" value="cheese"> Extra Cheese</label></p>
    <p><label><input name="topping" type="checkbox" value="onion"> Mushroom</label></p>
    <p><label><input name="topping" type="checkbox" value="mushroom"> Onion</label></p>
  </fieldset>
  
  <p><label>Preferred delivery time: <input name="delivery" type="time"></label></p>
  <p><label>Delivery instructions: <textarea name="comments"></textarea></p>
  
  <p><button>Submit order</button></p>
</form>
```

#### Submission Flow Investigation

I tested the form submission to understand the response:

1. **Form Submission**: POST request to `/post` endpoint
2. **Response Page**: Returns a page showing submitted data
3. **Data Format**: JSON-like structure embedded in HTML

#### Key Discoveries

**Form Fields:**
- `custname`: Text input for customer name
- `custtel`: Telephone input with validation
- `custemail`: Email input with format (@) validation
- `size`: Radio buttons (small, medium, large)
- `topping`: Checkboxes (bacon, cheese, onion, mushroom)
- `delivery`: Time input (HH:MM format)
- `comments`: Textarea for additional instructions

#### Response Structure Analysis

**Successful Submission Response:**
The response page contains the submitted data in this format:

```json
{
  "args": {},
  "data": "",
  "files": {},
  "form": {
    "custname": "John Doe",
    "custtel": "1234567890",
    "custemail": "john@example.com",
    "size": "medium",
    "topping": ["cheese", "bacon"],
    "delivery": "18:30",
    "comments": "Extra crispy please"
  },
  "headers": {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
    "Content-Length": "104",
    "Content-Type": "application/x-www-form-urlencoded",
    "Host": "httpbin.org",
    "Origin": "https://httpbin.org",
    "Priority": "u=0, i",
    "Referer": "https://httpbin.org/forms/post",
    "Sec-Ch-Ua": "'Google Chrome';v='137', 'Chromium';v='137', 'Not/A)Brand';v='24'",
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": "'macOS'",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    "X-Amzn-Trace-Id": "Root=1-68994ab4-0fa63e8b41827a801b166d2a"
  },
    "json": null,
    "origin": "xx.xxx.xx.xx",
    "url": "https://httpbin.org/post"
}
```

#### There were some challenges, doable of course, that I had to tackle in order to implement this process:

**1. Form Interaction:**
- Programmatically fill form fields
- Handle different input types (text, radio, checkbox, time)
- Submit form and wait for response

**2. Response Extraction:**
- Response is embedded in HTML page
- Need to parse JSON from HTML content
- Handle potential parsing errors

**3. Browser Automation:**
- Must use Playwright as required for POST requests

#### Solution Strategy

**Playwright Implementation:**
```typescript
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('https://httpbin.org/forms/post');

await page.fill('input[name="custname"]', formData.custname);
await page.check(`input[name="size"][value="${formData.size}"]`);

await page.click('button:has-text("Submit order")');

const responseData = await page.evaluate(() => {
  const formDataElement = document.querySelector('pre');
  return JSON.parse(formDataElement.textContent || '{}');
});
```

Next, one thing I want to mention is exponential backoff, which allows the application to retry requests that error out in an efficient manner. For the scope of this project, it may not seem necessary, but as an application scales to have millions of results, it would definitely come in handy.

#### Resilience and Retry Logic

**Exponential Backoff Implementation:**
To handle transient failures and network issues, the form submission includes intelligent retry logic with exponential backoff:

```typescript
export async function submitFormWithRetry(
  request: HttpbinFormRequest,
  maxRetries: number = 3
): Promise<FormSubmissionResult> {
  let lastError: FormSubmissionError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      ...
    } catch (error) {
      ...
      // exponential backoff
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  return lastError!;
}
```

**How Exponential Backoff Works:**
- **Attempt 1**: Immediate retry
- **Attempt 2**: Wait 2 seconds
- **Attempt 3**: Wait 4 seconds
- **Attempt 4**: Wait 8 seconds

**Benefits:**
- **Improved reliability** for transient network issues
- **Server-friendly** - doesn't hammer the API with rapid retries
- **User experience** - automatically handles temporary failures
- **Production-ready** - handles real-world network conditions
- Handle browser lifecycle (launch, page creation, cleanup)
- Manage timeouts and error scenarios

## 🎯 Design Decisions

### Architecture Decisions

**1. Separation of Concerns:**
- **Routes**: Pure business logic and API integration
- **Types**: Complete type definitions and interfaces
- **Tests**: Comprehensive validation and edge case testing
- **Investigation**: Documentation of exploration process

**Rationale**: Clean separation makes the code maintainable and testable.

**2. Error Handling Strategy:**

Responses returned could either be successful or not, so I defined two types of responses and allowed the final result to be either of them:

```typescript
export type SearchResult = DuckDuckGoSearchResponse | SearchError;
export type FormSubmissionResult = HttpbinFormResponse | FormSubmissionError;

// error schema specifically for the DuckDuckGo implementation
export interface SearchError {
  error: string; 
  message: string;
  statusCode: number;
}
```

### Type System Decisions

**1. Comprehensive Type Coverage:**
```typescript
export interface DuckDuckGoSearchResponse {
  Abstract: string;
  AbstractSource: string;
  AbstractText: string;
  AbstractURL: string;
  Heading: string;
  Image: string;
  ImageHeight: number;
  ImageWidth: number;
  // ... the rest is in search.types.ts
}
```

**Rationale**: 
- Complete type safety prevents runtime errors

**2. Union Types for Error Handling:**
```typescript
export type SearchResult = DuckDuckGoSearchResponse | SearchError;
export type FormSubmissionResult = HttpbinFormResponse | FormSubmissionError;
```

**Rationale**:
- Type-safe error handling
- Compile-time checking of error cases
- Clear success/error distinction

## 🧪 Testing Strategy

### Comprehensive Test Coverage

**Jest Test Suite (16 tests):**
- **Search API Tests**: Input validation, error handling, response structure, network failures, API errors, type safety
- **Submit API Tests**: Form validation, submission success/failure, timeout handling, retry logic, response structure validation

**Demo Script Tests:**
- **Functional Testing**: Real API calls with actual data to demonstrate working functionality
- **Error Handling**: Tests various error scenarios like empty queries, XSS sanitization, and form validation failures
- **Integration Testing**: End-to-end workflows showing how both APIs work together in a real application

**Test Coverage Areas:**
- **Success Paths**: Normal operation with various inputs
- **Error Scenarios**: Network failures, validation errors, API errors, timeouts
- **Edge Cases**: Empty inputs, malformed data, special characters
- **Type Safety**: Response structure validation and TypeScript compliance

## 🚀 Getting Started

### Installation
```bash
# Install dependencies (node_modules folder)
npm install

# Run Jest tests
npm test

# Run the full demo (builds it as well)
npm run demo

# Build project
npm run build
```

## 🔧 Investigation Tools Used

### DuckDuckGo API Testing
- **curl commands** for parameter testing
- **Online JSON formatters** for response inspection

### Httpbin Form Testing
- **Browser DevTools** for form structure analysis
- **Playwright** for automated form interaction
- **Manual form submission** for response analysis

### Key Discoveries from Testing
1. **DuckDuckGo API** responds pretty consistently for different searches
2. **Empty DuckDuckGo queries** return empty responses (not errors)
3. **Special characters** need proper encoding
4. **Httpbin form** cannot be tested directly with curl due to HTML form structure
5. **Browser automation** (Playwright) is required for form testing

## 💡 Key Insights

This project demonstrates:

1. **Real-world API integration** where formal documentation is unavailable
2. **Systematic investigation** using multiple tools and approaches
3. **Production-ready code** with comprehensive error handling
4. **Type-safe implementation** with complete TypeScript coverage
5. **Comprehensive testing** that validates real API behavior
6. **Documentation of process** showing the thought process behind implementation

## 🎉 Conclusion

This investigation process demonstrates real-world API integration skills where formal documentation is unavailable. The systematic approach to API discovery, comprehensive type definition, and production-ready implementation showcase the skills needed for real-world integration work.

## ✅ Expected Test Results

When you run `npm test`, you should see output similar to this:

```bash
saatvikbilla@Saatviks-MacBook-Pro sandybox-main % npm test

> sandybox-main@1.0.0 test
> jest

 PASS  tests/search.test.ts
 PASS  tests/submit.test.ts (11.325 s)

Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        11.641 s, estimated 12 s
Ran all test suites.

✨  All tests passed successfully!
```