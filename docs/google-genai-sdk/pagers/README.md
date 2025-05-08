# Pagers

The Pagers module provides functionality for working with paginated results from the GenAI API.

## PagedItem Enumeration

```typescript
enum PagedItem {
  PAGED_ITEM_BATCH_JOBS = "batchJobs",
  PAGED_ITEM_CACHED_CONTENTS = "cachedContents",
  PAGED_ITEM_FILES = "files",
  PAGED_ITEM_MODELS = "models",
  PAGED_ITEM_TUNING_JOBS = "tuningJobs"
}
```

## Pager Class

The `Pager<T>` class facilitates iterating through paginated results.

### Constructor

```typescript
constructor(
  name: PagedItem,
  request: (params: PagedItemConfig) => Promise<PagedItemResponse<T>>,
  response: PagedItemResponse<T>,
  params: PagedItemConfig
)
```

### Accessors

- `name`: Returns the type of paged item (e.g., batch_jobs)
- `page`: Returns the current page, which is a list of items
- `pageLength`: Returns the total number of items in the current page
- `pageSize`: Returns the length of the page fetched each time by this pager
- `params`: Returns the parameters when making the API request for the next page

### Methods

#### `[asyncIterator](): AsyncIterator<T>`

Returns an async iterator that supports iterating through all items retrieved from the API.

Example:
```typescript
const pager = await ai.files.list({config: {pageSize: 10}});
for await (const file of pager) {
  console.log(file.name);
}
```

#### `getItem(index: number): T`

Returns the item at the given index.

#### `hasNextPage(): boolean`

Returns true if there are more pages to fetch from the API.

#### `nextPage(): Promise<T[]>`

Fetches the next page of items by making a new API request.

Example:
```typescript
const pager = await ai.files.list({config: {pageSize: 10}});
let page = pager.page;
while (true) {
  for (const file of page) {
    console.log(file.name);
  }
  if (!pager.hasNextPage()) {
    break;
  }
  page = await pager.nextPage();
}
```