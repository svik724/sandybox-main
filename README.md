# Take Home Assignment

## Overview

This assignment tests your ability to reverse-engineer undocumented APIs, define proper TypeScript types, and implement backend routes. This simulates real-world integration work where formal API specifications don't exist, requiring you to explore, analyze, and formalize APIs through investigation.

## Target APIs

You will be working with two different APIs that require different implementation approaches:

1. **DuckDuckGo Search API** (GET request)
2. **httpbin.org Form Post API** (POST request via UI form)

## Implementation Requirements

### HTTP Method Requirements
- **GET routes** should use `fetch`
- **POST routes** must be implemented using `playwright` (to interact with web forms)

### Library Installation
You are expected to install and configure any necessary libraries (e.g. playwright) yourself. No package.json or dependencies are provided.

## File Structure & Expectations

### `types/` Directory
Define **all TypeScript types** in the `types/` directory. The provided files include only minimal scaffolding - you must:
- Document types thoroughly
- Investigate API responses completely
- Formalize all request and response structures
- Be comprehensive in your type definitions

### `routes/` Directory
The `routes/` directory includes stub files for you to implement the core integration logic. You are responsible for:
- Investigating the API shape and response structure
- Implementing proper error handling
- Following the specified HTTP method requirements

### `tests/` Directory
Tests in `tests/` must assert correctness of data returned from your implementations. Your tests should:
- Validate response data structure
- Test error scenarios
- Ensure type safety
- Verify integration functionality

### `index.ts` File
The `index.ts` file should simply import the exported functions to validate wiring - no business logic should be implemented here.

## Key Challenge

**You will need to explore, analyze, and formalize the undocumented APIs.** The stubs include hints, but not everything is described. Be thorough in your investigation.

This assignment emphasizes:
- Real-world API exploration skills
- Comprehensive type formalization
- Proper integration implementation
- Test-driven validation

## Success Criteria

**Minimal Success:** We will know you are minimally successful when `npm test` executes successfully. 

Beyond that baseline, the rest is up to you as you explore the APIs and create the routes, types, and specs. Additional evaluation criteria include:

- All TypeScript types are properly defined and documented
- Routes correctly implement the specified HTTP methods and libraries
- Tests validate both success and error scenarios
- Code demonstrates understanding of API structure through exploration
- Implementation is production-ready with proper error handling

Good luck! Remember, this mirrors real-world scenarios where you'll need to integrate with APIs that lack complete documentation.