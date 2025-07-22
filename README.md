# TTYSC Backend API (mock server)

## General Information

**TTYSC Backend API v1.0.0**

This is a simple API for TTYSC Backend

### License

This API is under an Apache 2.0 license.

Read the full license [here](http://www.apache.org/licenses/LICENSE-2.0.html)

### Servers

| URL                          | Description   | Variables |
| ---------------------------- | ------------- | --------- |
| https://TTYSC.backendtv1/api | TTYSC Backend | -         |

### Security

The following security schemes are used by this API for authentication and authorization. These must be taken into account in every request unless otherwise stated.

#### Bearer Authentication

This API is secured through bearer token authentication.

To authenticate requests, include the token in JWT format prefixed with `Bearer` in the request as the value of the Authorization header.

```
GET: example
Host: example.cse
Authorization: Bearer dWd:jE6c6Fx36vcmb#fM=
```

## 🔧 Standardized Query Parameters

All endpoints now support the same query parameters for consistent behavior:

### Pagination

- `_page=1` - Page number (default: 1)
- `_limit=10` - Items per page (default: 10)

### Sorting

- `_sort=field` - Field to sort by
- `_order=asc|desc` - Sort order (default: asc)

### Search

- `q=text` - Full-text search across all fields
- `search=text` - Custom search (legacy compatibility)

### Field Filtering

- `field=value` - Exact match filter
- `field_gte=value` - Greater than or equal
- `field_lte=value` - Less than or equal
- `field_ne=value` - Not equal
- `field_like=text` - Contains text (case insensitive)

### Response Format

All GET requests return a standardized response format:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "totalCount": 10,
    "totalPages": 3,
    "currentPage": 1,
    "perPage": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Operations

- **settings**
- **definitions**
- **feedback**
- **options**
- **cases**
- **chat**
- **auxiliary**

## Settings

User preferences and configuration

- **POST /settings (saveUserSettings)**
- **GET /settings (getUserSettings)**

### POST /settings (saveUserSettings)

Save user settings

Stores user-specific UI settings such as toggle states and visibility options.

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**: No Query Parameters
- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies

#### Request Body

Required.

Media Type: **application/json**

| Key            | Type    | Required | Example | Notes |
| -------------- | ------- | -------- | ------- | ----- |
| shareChats     | boolean | Yes      | -       | -     |
| hideIndexTable | boolean | Yes      | -       | -     |

#### Responses

- **200 OK**: Preferences successfully saved
- **400 Bad Request**: Invalid or missing parameters
- **401 Unauthorized**: Authentication required
- **500 Internal Server Error**: Server error

### GET /settings (getUserSettings)

Get user settings

Retrieves the stored UI settings for the authenticated user.

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**: No Query Parameters
- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies
- **Request Body**: No Request Body

#### Responses

- **200 OK**: Successfully retrieved user settings
- **400 Bad Request**: Invalid or missing parameters
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Settings not found for the user
- **500 Internal Server Error**: Server error

## Definitions

Definition dropdown content

- **GET /definitions (getDefinitions)**

### GET /definitions (getDefinitions)

Get list of definitions

Returns the list of available definitions to populate the UI.

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**:

| Key    | Type   | Required | Example | Notes |
| ------ | ------ | -------- | ------- | ----- |
| search | string | No       | -       | -     |

- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies
- **Request Body**: No Request Body

#### Responses

- **200 OK**: List of definitions
- **401 Unauthorized**: Authentication required
- **500 Internal Server Error**: Server error

## Feedback

User feedback submissions

- **POST /feedback (submitFeedback)**

### POST /feedback (submitFeedback)

Submit feedback

Allows users to submit feedback messages.

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**: No Query Parameters
- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies

#### Request Body

Required.

Media Type: **application/json**

| Key     | Type   | Required | Example | Notes |
| ------- | ------ | -------- | ------- | ----- |
| message | string | Yes      | -       | -     |

#### Responses

- **200 OK**: Feedback submitted successfully
- **400 Bad Request**: Invalid or missing parameters
- **401 Unauthorized**: Authentication required
- **500 Internal Server Error**: Server error

## Options

Raw data

- **GET /options/tables (getAvailableDataTables)**
- **GET /options (getData)**

### GET /options/tables (getAvailableDataTables)

Get list of available data tables

Lists available tables for data exploration.

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**: No Query Parameters
- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies
- **Request Body**: No Request Body

#### Responses

- **200 OK**: List of available tables
- **401 Unauthorized**: Authentication required
- **500 Internal Server Error**: Server error

### GET /options (getData)

Get all data for selected table

Retrieves all the valid table data to be filtered and shown by UI.

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**:

| Key       | Type   | Required | Example | Notes |
| --------- | ------ | -------- | ------- | ----- |
| tableName | string | Yes      | -       | -     |

- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies
- **Request Body**: No Request Body

#### Responses

- **200 OK**: Successfully retrieved table's data
- **401 Unauthorized**: Authentication required
- **500 Internal Server Error**: Server error

## Cases

Dynamic filter retrieval based on selected analysis

- **GET /cases/analysis (getAnalysisType)**
- **GET /cases (getCaseFilters)**

### GET /cases/analysis (getAnalysisType)

Get list of available analysis type

Lists available analysis types for AI interactions.

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**: No Query Parameters
- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies
- **Request Body**: No Request Body

#### Responses

- **200 OK**: List of available analysis types
- **400 Bad Request**: Invalid or missing parameters
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Server error

### GET /cases (getCaseFilters)

Get all analysis type filters names and keys for AI interactions

Returns all possible name and key selections of organization, CM, SKU, NVPN filters

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**:

| Key              | Type   | Required | Example | Notes |
| ---------------- | ------ | -------- | ------- | ----- |
| analysisNameType | string | Yes      | -       | -     |

- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies
- **Request Body**: No Request Body

#### Responses

- **200 OK**: Successfully retrieved filters for selected analysis type
- **400 Bad Request**: Invalid or missing parameters
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Server error

## Chat

User interactions with AI

- **POST /chat (postUserMessage)**
- **POST /chat/stream (postUserMessageStream)**

### POST /chat (postUserMessage)

Submit user message for AI analysis

Sends a structured conversation history to the AI engine, which processes the messages

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**: No Query Parameters
- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies

#### Request Body

Required.

Media Type: **application/json**

| Key                | Type    | Required | Example | Notes |
| ------------------ | ------- | -------- | ------- | ----- |
| messages           | object  | Yes      | -       | -     |
| use_knowledge_base | boolean | No       | -       | -     |

#### Responses

- **200 OK**: Successfully processed chat request
- **400 Bad Request**: Invalid or missing parameters
- **401 Unauthorized**: Authentication required
- **500 Internal Server Error**: Server error

### POST /chat/stream (postUserMessageStream)

Submit user message and receive streamed AI analysis

Sends chat messages to the AI engine and receives a streamed response chunk, suitable for displaying partial completions or updates progressively.

#### Required Scopes

This endpoint requires the following scopes:

- **Path Parameters**: No Path Parameters
- **Query Parameters**: No Query Parameters
- **Request Headers**: No Specific Request Headers
- **Cookies**: No Cookies

#### Request Body

Required.

Media Type: **application/json**

| Key                | Type    | Required | Example | Notes |
| ------------------ | ------- | -------- | ------- | ----- |
| messages           | object  | Yes      | -       | -     |
| use_knowledge_base | boolean | No       | -       | -     |

#### Responses

- **200 OK**: Successfully streamed AI response chunk
- **400 Bad Request**: Invalid or missing parameters
- **401 Unauthorized**: Authentication required
- **500 Internal Server Error**: Server error

## Auxiliary

AI structure responses like tables, code snippets, and charts

- **GET /auxiliary/table-data**
- **GET /auxiliary/code-snippet**
- **GET /auxiliary/chart**

### GET /auxiliary/table-data

Get structured table data from AI analysis

Returns tabular data including column definitions and row data generated from an AI analysis session.

#### Path Parameters

No Path Parameters.

#### Query Parameters

No Query Parameters.

#### Request Headers

No Specific Request Headers

#### Cookies

No Cookies.

#### Request Body

No Request Body.

#### Responses

- **200 OK**: Successful response with table data
- **500 Internal Server Error**: Server error

### GET /auxiliary/code-snippet

Get AI-generated code used in analysis

Returns the code (e.g., Python) used by the AI to perform the computation or analysis.

#### Path Parameters

No Path Parameters.

#### Query Parameters

No Query Parameters.

#### Request Headers

No Specific Request Headers

#### Cookies

No Cookies.

#### Request Body

No Request Body.

#### Responses

- **200 OK**: Code snippet generated by AI
- **500 Internal Server Error**: Server error

### GET /auxiliary/chart

Get AI response with optional chart data

Returns the AI-generated analysis including headline, timestamp, preamble, narrative response, and chart metadata if present.

#### Path Parameters

No Path Parameters.

#### Query Parameters

No Query Parameters.

#### Request Headers

No Specific Request Headers

#### Cookies

No Cookies.

#### Request Body

No Request Body.

#### Responses

- **200 OK**: AI response including metadata and chart content
- **500 Internal Server Error**: Server error
