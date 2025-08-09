# Facilitator Data Migration: User Level to Family Level

## Overview

This document describes the migration of facilitator selection data from being stored at the user level to the family level in the RTD Connect home education portal.

## Why This Migration?

Previously, facilitator selections were stored per individual user in the `users/${uid}` path. However, this doesn't align with how facilitators actually work - they support entire families, not individual users. The migration moves this data to the family level at `homeEducationFamilies/familyInformation/${familyId}`.

## Benefits

1. **Logical Data Structure**: Facilitators work with families, not individual users
2. **Shared Access**: All family members can see the family's facilitator
3. **Consistency**: Aligns with other family-level data like student information
4. **Better Reporting**: Easier to generate facilitator workload reports by family

## Migration Process

### Phase 1: Dual Storage (Current State)

The system now writes facilitator data to both locations:
- **Primary**: Family level (`homeEducationFamilies/familyInformation/${familyId}`)
- **Legacy**: User level (`users/${uid}`) - for backward compatibility

And reads from both locations with family level taking precedence:
- First loads from user level (legacy support)
- Then loads from family level (overwrites if present)

### Phase 2: Data Migration Script

Use the migration script to copy existing user-level facilitator data to family level:

```bash
# Run dry run first to see what would be migrated
node migrate-facilitator-to-family.js --dry-run

# Run actual migration
node migrate-facilitator-to-family.js --migrate
```

### Phase 3: Legacy Cleanup (Future)

After confirming all data is migrated and working properly:
1. Remove user-level writes from `handleFacilitatorSelect` and `handleFacilitatorChange`
2. Remove user-level reads from the user profile useEffect
3. Clean up old user-level facilitator data

## Database Structure Changes

### Before (User Level)
```
users/
  ${uid}/
    selectedFacilitatorId: "facilitator-id"
    selectedFacilitator: { ... facilitator object ... }
    facilitatorSelectedAt: "2024-01-01T00:00:00.000Z"
```

### After (Family Level)
```
homeEducationFamilies/
  familyInformation/
    ${familyId}/
      selectedFacilitatorId: "facilitator-id"
      selectedFacilitator: { ... facilitator object ... }
      facilitatorSelectedAt: "2024-01-01T00:00:00.000Z"
      facilitatorSelectedBy: "user-uid-who-selected"
      facilitatorMigratedAt: "2024-01-01T00:00:00.000Z" (if migrated)
      facilitatorMigratedFrom: "original-user-uid" (if migrated)
```

## Code Changes Made

### Dashboard.js

1. **New useEffect**: Added family-level facilitator data loading
2. **Updated handleFacilitatorSelect**: Now saves to both user and family levels
3. **Updated handleFacilitatorChange**: Now saves to both user and family levels
4. **Load Priority**: Family level data takes precedence over user level

### Migration Script

- `migrate-facilitator-to-family.js`: Automated migration tool with dry-run support

## Testing

1. **Existing Users**: Should continue to work with user-level data
2. **New Selections**: Should save to both levels
3. **Migrated Data**: Should load from family level
4. **SOLO Forms**: Should continue to receive facilitator data via props

## Rollback Plan

If issues arise, the migration can be rolled back by:
1. Temporarily disabling family-level reads
2. Continuing with user-level data only
3. Investigating and fixing issues
4. Re-enabling family-level functionality

The dual-storage approach ensures no data loss during transition.