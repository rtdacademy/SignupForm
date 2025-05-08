# Files in Google GenAI SDK

The `Files` class in the Google GenAI SDK allows you to upload, manage, and use files with the Gemini API. This feature is useful for working with documents, images, and other file types that you want to reference in your AI interactions.

## Overview

The Files functionality enables:
- Uploading files to the Gemini API
- Referencing uploaded files in content generation
- Managing uploaded files (listing, getting details, downloading, deleting)

## Class Definition

```typescript
class Files extends BaseModule {
  constructor(apiClient: ApiClient);
  
  // Methods
  upload(params: UploadFileParameters): Promise<File>;
  get(params: GetFileParameters): Promise<File>;
  list(params?: ListFilesParameters): Promise<Pager<File>>;
  download(params: DownloadFileParameters): Promise<void>;
  delete(params: DeleteFileParameters): Promise<DeleteFileResponse>;
}
```

## Methods

### upload()

Uploads a file asynchronously to the Gemini API. This method is not available in Vertex AI.

```typescript
upload(params: UploadFileParameters): Promise<File>
```

**Parameters:**
- `params`: The parameters for the upload request.
  - `file`: File path (string) or Blob object
  - `config`: Optional configuration (including mimeType)

**Returns:** A promise that resolves to a File object.

**Supported upload sources:**
- Node.js: File path (string) or Blob object.
- Browser: Blob object (e.g., File).

**Remarks:**
- The mimeType can be specified in the config parameter. If omitted:
  - For file path inputs, the mimeType will be inferred from the file extension.
  - For Blob object inputs, the mimeType will be set to the Blob's type property.
- Some examples for file extension to mimeType mapping:
  - .txt → text/plain
  - .json → application/json
  - .jpg → image/jpeg
  - .png → image/png
  - .mp3 → audio/mpeg
  - .mp4 → video/mp4

**Example:**
```javascript
const file = await ai.files.upload({
  file: 'file.txt', 
  config: {
    mimeType: 'text/plain',
  }
});
console.log(file.name);
```

### get()

Retrieves file information from the service.

```typescript
get(params: GetFileParameters): Promise<File>
```

**Parameters:**
- `params`: The parameters for the get request.
  - `name`: The name of the file to retrieve.

**Returns:** A promise that resolves to the File object requested.

**Example:**
```javascript
const config = {
  name: fileName,
};
const file = await ai.files.get(config);
console.log(file.name);
```

### list()

Lists all current project files from the service.

```typescript
list(params?: ListFilesParameters): Promise<Pager<File>>
```

**Parameters:**
- `params`: The parameters for the list request (optional).
  - `config`: Optional configuration (including pageSize).

**Returns:** The paginated results of the list of files.

**Example:**
```javascript
// List files with a page size of 10
const listResponse = await ai.files.list({config: {'pageSize': 10}});
for await (const file of listResponse) {
  console.log(file.name);
}
```

### download()

Downloads a remotely stored file asynchronously to a specified location. This method only works in Node environment; for browser downloads, use browser-compliant methods like an `<a>` tag.

```typescript
download(params: DownloadFileParameters): Promise<void>
```

**Parameters:**
- `params`: The parameters for the download request.
  - `file`: The name of the file to download.
  - `downloadPath`: The path where the file should be saved.

**Returns:** A promise that resolves when the download is complete.

**Example:**
```javascript
// Download a file to the local filesystem
await ai.files.download({
  file: file.name,
  downloadPath: 'file.txt'
});
```

### delete()

Deletes a remotely stored file.

```typescript
delete(params: DeleteFileParameters): Promise<DeleteFileResponse>
```

**Parameters:**
- `params`: The parameters for the delete request.
  - `name`: The name of the file to delete.

**Returns:** A DeleteFileResponse object.

**Example:**
```javascript
// Delete a file
await ai.files.delete({name: file.name});
```

## Using Files in Content Generation

After uploading files, you can reference them in content generation requests:

```javascript
// Upload a file
const uploadedFile = await ai.files.upload({
  file: 'document.pdf',
  config: {
    mimeType: 'application/pdf'
  }
});

// Reference the file in a content generation request
const response = await ai.models.generateContent({
  model: 'gemini-1.5-pro',
  contents: 'Summarize this document',
  config: {
    files: [uploadedFile.name]
  }
});

console.log(response.text);
```

## Best Practices

1. **Use Appropriate MIME Types**: Always specify the correct MIME type for your files to ensure proper handling.

2. **Clean Up Unused Files**: Delete files that are no longer needed to manage your usage and quota.

3. **File Size Considerations**: Be aware of file size limits and optimize files when possible.

4. **Error Handling**: Implement robust error handling for file operations, especially for upload and download.

5. **Security Considerations**: Don't upload sensitive or confidential information without proper precautions.

For more details on Files functionality, refer to the [official documentation](https://googleapis.github.io/js-genai/release_docs/classes/files.Files.html).