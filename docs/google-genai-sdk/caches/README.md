# Caches in Google GenAI SDK

The `Caches` class in the Google GenAI SDK allows you to create and manage cached content, which can help reduce costs when repeatedly using the same large prompt prefix.

## Overview

Caching content is particularly useful for:
- Storing large context that gets reused across multiple requests
- Reducing token usage for repeated prompts
- Improving response time for common queries

## Class Definition

```typescript
class Caches extends BaseModule {
  constructor(apiClient: ApiClient);
  
  // Methods
  create(params: CreateCachedContentParameters): Promise<CachedContent>;
  get(params: GetCachedContentParameters): Promise<CachedContent>;
  list(params?: ListCachedContentsParameters): Promise<Pager<CachedContent>>;
  update(params: UpdateCachedContentParameters): Promise<CachedContent>;
  delete(params: DeleteCachedContentParameters): Promise<DeleteCachedContentResponse>;
}
```

## Methods

### create()

Creates a cached contents resource.

```typescript
create(params: CreateCachedContentParameters): Promise<CachedContent>
```

**Parameters:**
- `params`: The parameters for the create request.

**Returns:** The created cached content.

**Remarks:**
Context caching is only supported for specific models. See Gemini Developer API reference and Vertex AI reference for more information.

**Example:**
```javascript
const contents = ...; // Initialize the content to cache.
const response = await ai.caches.create({
  model: 'gemini-2.0-flash-001',
  config: {
   'contents': contents,
   'displayName': 'test cache',
   'systemInstruction': 'What is the sum of the two pdfs?',
   'ttl': '86400s',
 }
});
```

### get()

Gets cached content configurations.

```typescript
get(params: GetCachedContentParameters): Promise<CachedContent>
```

**Parameters:**
- `params`: The parameters for the get request.

**Returns:** The cached content.

**Example:**
```javascript
await ai.caches.get({name: '...'}); // The server-generated resource name.
```

### list()

Lists cached content configurations.

```typescript
list(params?: ListCachedContentsParameters): Promise<Pager<CachedContent>>
```

**Parameters:**
- `params`: The parameters for the list request (optional).

**Returns:** The paginated results of the list of cached contents.

**Example:**
```javascript
const cachedContents = await ai.caches.list({config: {'pageSize': 2}});
for (const cachedContent of cachedContents) {
  console.log(cachedContent);
}
```

### update()

Updates cached content configurations.

```typescript
update(params: UpdateCachedContentParameters): Promise<CachedContent>
```

**Parameters:**
- `params`: The parameters for the update request.

**Returns:** The updated cached content.

**Example:**
```javascript
const response = await ai.caches.update({
  name: '...',  // The server-generated resource name.
  config: {'ttl': '7600s'}
});
```

### delete()

Deletes cached content.

```typescript
delete(params: DeleteCachedContentParameters): Promise<DeleteCachedContentResponse>
```

**Parameters:**
- `params`: The parameters for the delete request.

**Returns:** The empty response returned by the API.

**Example:**
```javascript
await ai.caches.delete({name: '...'}); // The server-generated resource name.
```

## Practical Use Case

### Caching Large Context for Repeated Queries

When you have a large context (like a document) that needs to be referenced in multiple queries:

```javascript
// Step 1: Cache the document content
const documentContent = "..."; // Large document content
const cache = await ai.caches.create({
  model: 'gemini-2.0-flash-001',
  config: {
    'contents': [{
      role: 'user',
      parts: [{ text: documentContent }]
    }],
    'displayName': 'legal_document_context',
    'ttl': '86400s', // Cache for 24 hours
  }
});

// Step 2: Use the cached content in subsequent queries
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-001',
  contents: 'Summarize the key points of the document',
  config: {
    cachedContentIds: [cache.name]
  }
});

console.log(response.text);
```

## Best Practices

1. **Set Appropriate TTL**: Use an appropriate time-to-live (TTL) value for your cached content. Set it to match how long the content will be relevant.

2. **Use Descriptive Names**: Set clear display names to easily identify different caches.

3. **Monitor Cache Usage**: Keep track of your cached contents to avoid excess costs and remove outdated caches.

4. **Cache Large Contexts**: Cache content that is large and reused frequently to maximize cost savings.

5. **Check Model Support**: Verify that the model you're using supports caching functionality.

## Limitations

- Not all models support caching
- Cached content has a maximum size limit
- Caches have a default TTL if not specified
- There may be quotas on the number of caches you can create

For more details on content caching, refer to the [official documentation](https://googleapis.github.io/js-genai/release_docs/classes/caches.Caches.html).