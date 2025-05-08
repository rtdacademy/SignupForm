# Tunings

The Tunings module provides functionality for creating and managing model fine-tuning jobs.

## Tunings Class

Extends the BaseModule class and provides methods for working with tuning jobs.

### Constructor

```typescript
constructor(apiClient: ApiClient)
```

### Methods

#### get(params: GetTuningJobParameters): Promise<TuningJob>

**[Experimental]** Gets a TuningJob.

Parameters:
- `params`: GetTuningJobParameters

Returns:
- A TuningJob object

Note: The SDK's tuning implementation is experimental and may change in future versions.

#### list(params?: ListTuningJobsParameters): Promise<Pager<TuningJob>>

**[Experimental]** Lists tuning jobs.

Parameters:
- `params`: ListTuningJobsParameters (optional, default: {})

Returns:
- A Pager containing tuning jobs

Note: The SDK's tuning implementation is experimental and may change in future versions.

#### tune(params: CreateTuningJobParameters): Promise<TuningJob>

**[Experimental]** Creates a supervised fine-tuning job.

Parameters:
- `params`: The parameters for the tuning job

Returns:
- A TuningJob operation

Note: The SDK's tuning implementation is experimental and may change in future versions.