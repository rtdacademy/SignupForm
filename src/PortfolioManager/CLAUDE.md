# PortfolioManager Documentation

## Overview
The PortfolioManager is a comprehensive React-based system for managing student portfolios, including course structures, entries, file uploads, and SOLO education plan integration. It uses Firebase Firestore for data storage and supports real-time updates, archiving, and tag-based organization.

## Architecture

### Core Components & Update Targets

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

## Database Structure

### Firestore Collections
```
portfolios/
  {familyId}/
    metadata/
      {studentId} - Portfolio metadata document
    structure/
      {structureId} - Course/section/topic hierarchy
    entries/
      {entryId} - Individual portfolio entries
    comments/
      {commentId} - Comments on entries
```

### Key Fields
- **Metadata**: studentId, familyId, schoolYear, totalEntries, hasArchivedItems
- **Structure**: studentId, type, parentId, title, order, isAlbertaCourse, isArchived
- **Entries**: structureId, type, title, content, files, tags, createdAt
- **Comments**: entryId, userId, content, createdAt, updatedAt

## Common Update Scenarios

### Adding a New Entry Type
1. Update `PortfolioEntry.js` - Add icon and display logic
2. Update `PortfolioBuilder.js` - Add creation UI
3. Update `PortfolioQuickAdd.js` - Add to quick creation flow
4. Update `usePortfolio.js` - Add validation/processing if needed

### Modifying Database Schema
1. Update `usePortfolio.js` - Modify Firestore operations
2. Update affected components that display the data
3. Consider migration strategy for existing data

### Adding New Portfolio Features
1. Determine if it's portfolio-wide or entry-specific
2. For portfolio-wide: Start with `PortfolioManager.js` and `usePortfolio.js`
3. For entry-specific: Start with `PortfolioEntry.js` and `PortfolioBuilder.js`

### Improving Mobile Experience
1. Focus on `PortfolioManager.js` - Responsive layout logic
2. Update `PortfolioQuickAdd.js` - Mobile-optimized quick actions
3. Modify `PortfolioSidebar.js` - Mobile navigation sheet

### Integration with SOLO Plans
1. Primary hook: `useSOLOIntegration` in `usePortfolio.js`
2. Tag suggestions: `PortfolioTagSelector.js`
3. Alberta course sync: Auto-sync logic in `usePortfolio.js`

## State Management
- Uses React hooks (useState, useEffect, useCallback)
- Real-time Firestore subscriptions for live updates
- Optimistic UI updates with error rollback
- Undo functionality for destructive actions

## Performance Considerations
- Lazy loading of portfolio entries
- Real-time listeners only for active components
- File upload progress tracking
- Debounced search and filter operations

## Security & Permissions
- Role-based access (student, parent, staff)
- Portfolio ownership verification
- File upload validation and sanitization
- Comment moderation capabilities

## Testing Checklist
- [ ] Portfolio creation for new student
- [ ] Alberta course auto-sync from SOLO plan
- [ ] Entry creation (all types)
- [ ] File upload/delete operations
- [ ] Archive/restore functionality
- [ ] Comment system
- [ ] Mobile responsive design
- [ ] Real-time updates across sessions
- [ ] Tag suggestions and filtering
- [ ] Access control for different user roles