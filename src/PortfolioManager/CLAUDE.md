# PortfolioManager Documentation

## Overview
The PortfolioManager is a comprehensive React-based system for managing student portfolios using a collections and entries architecture. It provides hierarchical organization of portfolio content, real-time synchronization with Firebase Firestore, automatic integration with Alberta SOLO Education Plans, and support for multiple content types including text, files, and media.

## Important: Working with this System
- **DO NOT** run build or start commands - this is an integrated module
- **Focus on** understanding the data flow and component interactions
- **Test changes** through the main application's portfolio section
- **Database operations** are handled through Firebase Firestore
- **Real-time sync** happens automatically via Firestore listeners

## Core Concepts

### Collections & Entries System
- **Collections**: Organizational containers (portfolios, courses, folders) that group related content
- **Entries**: Individual pieces of content (assignments, projects, reflections) within collections
- **Structure**: Hierarchical organization allowing nested collections for flexible portfolio organization
- **Types**:
  - Structure types: `portfolio`, `collection`, `course` (containers)
  - Entry types: `text`, `document`, `image`, `video`, `link`, `assessment`

## Architecture

### Core Components & Their Responsibilities

#### 1. **PortfolioManager.js** - Main Container
- **Purpose**: Orchestrates the entire portfolio system
- **Update for**:
  - Adding new quick actions or navigation features
  - Modifying overall layout (sidebar, mobile responsive design)
  - Integrating new portfolio-wide features
  - Access control modifications
  - SOLO plan integration changes

#### 2. **usePortfolio.js** - Data Management Hook
- **Purpose**: Handles all CRUD operations, Firebase sync, and Alberta course integration
- **Update for**:
  - Database schema changes
  - New portfolio operations (CRUD functions)
  - Alberta course synchronization logic
  - Archiving/restoration functionality
  - Portfolio metadata management
  - Real-time subscription modifications

#### 3. **PortfolioBuilder.js** - Content Creation & Display
- **Purpose**: Main workspace for creating and viewing portfolio entries
- **Update for**:
  - Entry creation workflow changes
  - Presentation mode features
  - View mode options (grid/list)
  - Entry type additions
  - Editor integration changes
  - DirectoryView integration

#### 4. **PortfolioEntry.js** - Individual Entry Component
- **Purpose**: Displays and manages individual portfolio entries
- **Update for**:
  - Entry display format changes
  - New entry types support
  - Preview functionality
  - Entry actions (edit, delete, download)
  - Comment integration

#### 5. **PortfolioSidebar.js** - Navigation & Structure Management
- **Purpose**: Hierarchical navigation and structure management
- **Update for**:
  - Navigation features
  - Structure item operations (create, edit, delete, archive)
  - Drag-and-drop reordering
  - Search and filter functionality
  - Collapsible sidebar behavior

#### 6. **PortfolioQuickAdd.js** - Rapid Entry Creation
- **Purpose**: Streamlined interface for quick portfolio entry creation
- **Update for**:
  - Quick add workflow improvements
  - New entry type support
  - File upload enhancements
  - Tag selection improvements
  - Mobile optimization

#### 7. **PortfolioDashboard.js** - Analytics & Overview
- **Purpose**: Portfolio statistics and activity tracking
- **Update for**:
  - New metrics or statistics
  - Progress tracking features
  - Activity monitoring
  - Tag coverage analysis
  - Export/sharing features

#### 8. **FileUploadManager.js** - File Handling
- **Purpose**: Manages file uploads, validation, and storage
- **Update for**:
  - File type restrictions
  - Upload size limits
  - Batch upload features
  - Drag-and-drop functionality
  - Camera/mobile upload features

#### 9. **PortfolioTagSelector.js** - Tag Management
- **Purpose**: AI-powered tag suggestions and manual tag selection
- **Update for**:
  - Tag categories modifications
  - AI suggestion algorithm changes
  - Tag display improvements
  - Search functionality
  - SOLO plan tag integration

#### 10. **PortfolioComments.js** - Feedback System
- **Purpose**: Comment threads on portfolio entries
- **Update for**:
  - Comment threading
  - Rich text editing
  - Comment notifications
  - Moderation features
  - Staff/parent visibility controls

#### 11. **PortfolioAccessGate.js** - Access Control
- **Purpose**: Controls portfolio access permissions
- **Update for**:
  - Permission levels
  - Access verification
  - Staff overrides
  - Parent/student access rules

#### 12. **PortfolioCourseSelector.js** - Course Selection UI
- **Purpose**: Interface for selecting portfolio structure/courses
- **Update for**:
  - Course display format
  - Selection workflow
  - Alberta course integration
  - Custom course support

#### 13. **DirectoryView.js** - Collection Contents Display
- **Purpose**: Visual directory-style view of collections and entries
- **Update for**:
  - Grid/list view toggles
  - Collection navigation
  - Entry previews
  - Drag-and-drop support
  - Search and filtering
  - Quick actions on items
  - Mobile-optimized layouts

## Database Structure

### Firestore Collections Hierarchy
```
portfolios/
  {familyId}/
    metadata/
      {studentId} - Portfolio-level metadata and statistics
    structure/
      {structureId} - Collections hierarchy (portfolios, collections, courses)
    entries/
      {entryId} - Individual content entries within collections
    comments/
      {commentId} - Feedback and comments on entries
```

### Document Schemas

#### Metadata Document
```javascript
{
  studentId: string,
  familyId: string,
  schoolYear: string,
  createdAt: timestamp,
  lastModified: timestamp,
  portfolioType: 'custom' | 'alberta-courses',
  totalEntries: number,
  totalFiles: number,
  starterCourseDeleted: boolean,
  hasArchivedItems: boolean,
  structuresInitialized: boolean
}
```

#### Structure Document (Collections)
```javascript
{
  id: string,
  studentId: string,
  schoolYear: string,
  type: 'portfolio' | 'collection' | 'course',
  parentId: string | null,  // null for top-level collections
  title: string,
  description: string,
  order: number,
  icon: string,
  color: string,
  isAlbertaCourse: boolean,
  albertaCourseId: string | null,
  courseCode: string | null,
  isArchived: boolean,
  archivedAt: timestamp | null,
  archivedBy: string | null,
  archivedReason: string | null,
  isStarterCourse: boolean,
  createdAt: timestamp,
  createdBy: string,
  lastModified: timestamp,
  tags: object
}
```

#### Entry Document
```javascript
{
  id: string,
  studentId: string,
  structureId: string,  // Links to parent collection
  type: 'text' | 'document' | 'image' | 'video' | 'link' | 'assessment',
  title: string,
  content: string | null,  // Rich text content for text entries
  description: string,
  files: [{
    url: string,
    name: string,
    type: string,
    size: number,
    uploadedAt: string,
    path: string
  }],
  tags: {
    activities: string[],
    assessments: string[],
    resources: string[],
    subjects: string[],
    custom: string[]
  },
  metadata: {
    wordCount: number,
    readTime: string,
    lastEdited: timestamp
  },
  commentCount: number,
  lastCommentAt: timestamp,
  createdAt: timestamp,
  createdBy: string,
  lastModified: timestamp,
  order: number,
  quickAdd: boolean,
  isPublic: boolean,
  shareSettings: object
}
```

#### Comment Document
```javascript
{
  id: string,
  entryId: string,
  authorEmail: string,
  authorName: string,
  authorUid: string,
  content: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  edited: boolean,
  editedBy: string | null,
  editedAt: timestamp | null
}
```

## Key Features & Workflows

### Collections System
1. **Hierarchical Organization**: Collections can be nested to create portfolios > courses > units > topics
2. **Auto-sync with Alberta Courses**: Automatically creates collections from SOLO Education Plans
3. **Archive System**: Soft-delete collections with restoration capability
4. **Drag & Drop Reordering**: Visual organization of collections and entries
5. **Virtual Structures**: Automatically derives collections from orphaned entries

### Entry Management
1. **Multiple Entry Types**: Text, documents, images, videos, links, assessments
2. **Quick Add**: Rapid entry creation with minimal fields
3. **Bulk Operations**: Select and operate on multiple entries
4. **File Management**: Upload, preview, and manage attached files
5. **Rich Text Editor**: Full-featured text editing with Quill

### SOLO Integration
1. **Automatic Course Sync**: Real-time sync with SOLO Education Plans
2. **Tag Suggestions**: AI-powered tag recommendations based on SOLO data
3. **Activity/Assessment/Resource Tracking**: Links entries to SOLO plan elements
4. **Archive on Plan Changes**: Automatically archives removed courses

## Data Flow

### Collection Creation Flow
```
User Action → createStructureItem() → Firestore Write → Real-time Update → UI Refresh
```

### Entry Creation Flow
```
User Input → File Upload (if needed) → createPortfolioEntry() → Update Metadata → Real-time Sync
```

### Alberta Course Sync Flow
```
SOLO Plan Change → Real-time Listener → Compare Courses → Batch Update → Archive/Restore
```

## Component Interaction Map

```
PortfolioManager
├── PortfolioAccessGate (permission check)
├── PortfolioSidebar (navigation)
│   ├── Structure Tree
│   ├── Create/Edit/Delete Collections
│   └── Drag & Drop Reordering
├── PortfolioBuilder (main workspace)
│   ├── DirectoryView (collection contents)
│   ├── PortfolioEntry (entry display)
│   ├── QuillEditor (text editing)
│   └── PortfolioTagSelector (tagging)
├── PortfolioQuickAdd (rapid creation)
└── Hooks
    ├── usePortfolio (data management)
    └── useSOLOIntegration (SOLO sync)
```

## Common Operations

### Creating a Collection
```javascript
await createStructureItem({
  type: 'collection',
  parentId: null,  // or parent collection ID
  title: 'My Collection',
  description: 'Collection description',
  icon: 'FolderOpen',
  color: '#8B5CF6'
});
```

### Creating an Entry
```javascript
await createPortfolioEntry({
  structureId: 'collection-id',
  type: 'text',
  title: 'My Entry',
  content: '<p>Rich text content</p>',
  tags: {
    activities: ['research'],
    assessments: ['portfolio'],
    subjects: ['english']
  }
}, files);  // Optional file array
```

### Archiving/Restoring
```javascript
// Archive (soft delete)
await deleteStructureItem(structureId);

// Restore
await restoreStructureItem(structureId);

// Get archived items
const archived = await getArchivedStructure();
```

## State Management
- **React Hooks**: useState, useEffect, useCallback, useRef
- **Real-time Subscriptions**: Firestore onSnapshot listeners
- **Optimistic Updates**: Immediate UI updates with rollback on error
- **Batch Operations**: writeBatch for multi-document updates

## Performance Optimizations
- **Lazy Loading**: Entries loaded only when collection selected
- **Subscription Management**: Cleanup of listeners on unmount
- **Debouncing**: Search and filter operations
- **Virtual Scrolling**: For large entry lists (planned)
- **Memoization**: useMemo for expensive computations

## Security & Permissions
- **Role-based Access**: Student owns content, parents/staff can view
- **Portfolio Ownership**: familyId + studentId verification
- **File Validation**: Type and size restrictions
- **Alberta Course Protection**: Cannot delete synced courses

## Error Handling
- **Graceful Degradation**: Continue operation despite individual failures
- **User Feedback**: Toast notifications for errors
- **Retry Logic**: Automatic retry for network failures
- **Rollback**: Revert optimistic updates on error

## Testing Scenarios
- [ ] Create nested collection structure
- [ ] Add entries of each type
- [ ] Upload and manage files
- [ ] Archive and restore collections
- [ ] SOLO plan course sync
- [ ] Tag suggestions and filtering
- [ ] Comment system functionality
- [ ] Mobile responsive behavior
- [ ] Real-time multi-user updates
- [ ] Permission enforcement

## Critical Implementation Notes

### Collection-Entry Relationship
- **Every entry MUST have a structureId** linking it to a parent collection
- **Collections can be virtual** - derived from entries if no structure doc exists
- **Orphaned entries** automatically generate virtual collections

### Alberta Course Integration
- **Automatic sync** happens on component mount and SOLO plan changes
- **Courses are protected** - cannot be manually deleted, only archived via plan removal
- **School year specific** - courses are tied to specific school years
- **Real-time updates** - uses Firebase onValue listener for instant sync

### Archiving System
- **Soft delete only** - items are archived, not deleted
- **Restoration available** - archived items can be restored
- **Metadata tracking** - tracks who archived, when, and why
- **Alberta courses special handling** - archived/restored based on SOLO plan

### Performance Critical Paths
1. **Initial Load**: Metadata → Structure → Selected Entries
2. **Collection Switch**: Unsubscribe old → Subscribe new → Load entries
3. **SOLO Sync**: Check existing → Compare → Batch update
4. **Reordering**: Batch update all affected items

### Common Pitfalls to Avoid
- **Don't forget studentId** in all documents
- **Always check isArchived** when querying structures
- **Use batch operations** for multiple updates
- **Clean up subscriptions** to prevent memory leaks
- **Handle virtual structures** when no docs exist

### Debugging Tips
- Check console for real-time subscription logs
- Verify Firestore indexes for compound queries
- Monitor batch operation counts
- Track subscription lifecycle events
- Use Firestore emulator for local testing