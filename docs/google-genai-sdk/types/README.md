# Google GenAI SDK Types

This file provides an overview of all available types in the Google GenAI SDK. Due to the extensive number of types, this document serves as a reference index rather than detailed documentation.

## Important Instructions for AI Assistants

If you need to use any of these types in your implementation:

1. **Request specific type documentation first**: Ask the user to provide the current documentation for any specific type you need to use.

2. **Do not assume implementations**: The SDK may change between versions, so always confirm the current structure and properties of any type before using it.

3. **Verify compatibility**: Ensure that the types you're working with are compatible with the current SDK version in use.

## Type Categories

### Enumerations (E)

```
ActivityHandling, AdapterSize, AuthType, BlockedReason, ControlReferenceType,
DynamicRetrievalConfigMode, EndSensitivity, FeatureSelectionPreference,
FileSource, FileState, FinishReason, FunctionCallingConfigMode,
HarmBlockMethod, HarmBlockThreshold, HarmCategory, HarmProbability,
HarmSeverity, ImagePromptLanguage, JobState, Language, MaskReferenceMode,
MediaModality, MediaResolution, Modality, Mode, Outcome, PersonGeneration,
SafetyFilterLevel, StartSensitivity, SubjectReferenceType, TrafficType,
TurnCoverage, Type
```

### Classes (C)

```
ComputeTokensResponse, CountTokensResponse, CreateFileResponse,
DeleteCachedContentResponse, DeleteFileResponse, DeleteModelResponse,
EmbedContentResponse, FunctionResponse, GenerateContentResponse,
GenerateContentResponsePromptFeedback, GenerateContentResponseUsageMetadata,
GenerateImagesResponse, GenerateVideosResponse, HttpResponse,
ListCachedContentsResponse, ListFilesResponse, ListModelsResponse,
ListTuningJobsResponse, LiveClientToolResponse, LiveSendToolResponseParameters,
LiveServerMessage, ReplayResponse
```

### Interfaces (I)

```
ActivityEnd, ActivityStart, ApiKeyConfig, AudioTranscriptionConfig,
AuthConfig, AuthConfigGoogleServiceAccountConfig, AuthConfigHttpBasicAuthConfig,
AuthConfigOauthConfig, AuthConfigOidcConfig, AutomaticActivityDetection,
Blob, CachedContent, CachedContentUsageMetadata, Candidate, Citation,
CitationMetadata, CodeExecutionResult, ComputeTokensConfig, ComputeTokensParameters,
Content, ContentEmbedding, ContentEmbeddingStatistics, ContextWindowCompressionConfig,
ControlReferenceConfig, ControlReferenceImage, CountTokensConfig, CountTokensParameters,
CreateCachedContentConfig, CreateCachedContentParameters, CreateChatParameters,
CreateFileConfig, CreateFileParameters, CreateTuningJobConfig, CreateTuningJobParameters,
DatasetDistribution, DatasetDistributionDistributionBucket, DatasetStats,
DeleteCachedContentConfig, DeleteCachedContentParameters, DeleteFileConfig,
DeleteFileParameters, DeleteModelConfig, DeleteModelParameters, DistillationDataStats,
DistillationHyperParameters, DistillationSpec, DownloadFileConfig, DownloadFileParameters,
DynamicRetrievalConfig, EmbedContentConfig, EmbedContentMetadata, EmbedContentParameters,
EncryptionSpec, Endpoint, EnterpriseWebSearch, ExecutableCode, FetchPredictOperationConfig,
FetchPredictOperationParameters, File, FileData, FileStatus, FunctionCall,
FunctionCallingConfig, FunctionDeclaration, GenerateContentConfig, GenerateContentParameters,
GeneratedImage, GeneratedVideo, GenerateImagesConfig, GenerateImagesParameters,
GenerateVideosConfig, GenerateVideosOperation, GenerateVideosParameters, GenerationConfig,
GenerationConfigRoutingConfig, GenerationConfigRoutingConfigAutoRoutingMode,
GenerationConfigRoutingConfigManualRoutingMode, GetCachedContentConfig,
GetCachedContentParameters, GetFileConfig, GetFileParameters, GetModelConfig,
GetModelParameters, GetOperationConfig, GetOperationParameters, GetTuningJobConfig,
GetTuningJobParameters, GoogleMaps, GoogleRpcStatus, GoogleSearch, GoogleSearchRetrieval,
GoogleTypeDate, GroundingChunk, GroundingChunkRetrievedContext, GroundingChunkWeb,
GroundingMetadata, GroundingSupport, HttpOptions, Image, LatLng, ListCachedContentsConfig,
ListCachedContentsParameters, ListFilesConfig, ListFilesParameters, ListModelsConfig,
ListModelsParameters, ListTuningJobsConfig, ListTuningJobsParameters, LiveCallbacks,
LiveClientContent, LiveClientMessage, LiveClientRealtimeInput, LiveClientSetup,
LiveConnectConfig, LiveConnectParameters, LiveSendClientContentParameters,
LiveSendRealtimeInputParameters, LiveServerContent, LiveServerGoAway,
LiveServerSessionResumptionUpdate, LiveServerSetupComplete, LiveServerToolCall,
LiveServerToolCallCancellation, LogprobsResult, LogprobsResultCandidate,
LogprobsResultTopCandidates, MaskReferenceConfig, MaskReferenceImage, ModalityTokenCount,
Model, ModelSelectionConfig, Operation, OperationGetParameters, Part, PartnerModelTuningSpec,
PrebuiltVoiceConfig, RagRetrievalConfig, RagRetrievalConfigFilter, RagRetrievalConfigHybridSearch,
RagRetrievalConfigRanking, RagRetrievalConfigRankingLlmRanker, RagRetrievalConfigRankingRankService,
RawReferenceImage, RealtimeInputConfig, ReplayFile, ReplayInteraction, ReplayRequest,
Retrieval, RetrievalConfig, RetrievalMetadata, SafetyAttributes, SafetyRating,
SafetySetting, Schema, SearchEntryPoint, Segment, SendMessageParameters,
SessionResumptionConfig, SlidingWindow, SpeechConfig, StyleReferenceConfig,
StyleReferenceImage, SubjectReferenceConfig, SubjectReferenceImage, SupervisedHyperParameters,
SupervisedTuningDatasetDistribution, SupervisedTuningDatasetDistributionDatasetBucket,
SupervisedTuningDataStats, SupervisedTuningSpec, TestTableFile, TestTableItem, ThinkingConfig,
TokensInfo, Tool, ToolCodeExecution, ToolConfig, Transcription, TunedModel, TunedModelInfo,
TuningDataset, TuningDataStats, TuningExample, TuningJob, TuningValidationDataset,
UpdateCachedContentConfig, UpdateCachedContentParameters, UpdateModelConfig,
UpdateModelParameters, UploadFileConfig, UploadFileParameters, UpscaleImageConfig,
UpscaleImageParameters, UsageMetadata, VertexAISearch, VertexRagStore,
VertexRagStoreRagResource, Video, VideoMetadata, VoiceConfig
```

### Type Aliases (T)

```
BlobImageUnion, ContentListUnion, ContentUnion, DownloadableFileUnion,
PartListUnion, PartUnion, SchemaUnion, SpeechConfigUnion, ToolListUnion
```

### Functions (F)

```
createModelContent, createPartFromBase64, createPartFromCodeExecutionResult,
createPartFromExecutableCode, createPartFromFunctionCall, createPartFromFunctionResponse,
createPartFromText, createPartFromUri, createUserContent
```

## Commonly Used Types

While all types listed above are available in the SDK, here are some of the most frequently used ones:

- **Content**: Represents content to be sent to the model
- **GenerationConfig**: Configuration for content generation
- **SafetySetting**: Safety settings for content generation
- **FunctionDeclaration**: Declaration of a function for function calling
- **Model**: Represents a Gemini model and its capabilities
- **Part**: Individual parts that make up Content (text, images, etc.)
- **File**: Represents a file uploaded to the API
- **GenerateContentResponse**: Response from generateContent method
- **Candidate**: Generated content candidate in a response
- **FunctionCall**: Function call object representing a model's request to call a function

## Request Specific Documentation

To use any of these types effectively, request the specific documentation for the type from the user:

Example prompt:
"I'd like to implement function calling with the Gemini API. Could you please provide the current detailed documentation for the FunctionDeclaration and FunctionCall types?"