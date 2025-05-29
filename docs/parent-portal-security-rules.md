# Parent Portal Security Rules Documentation

## Overview
This document outlines the Firebase Realtime Database security rules needed for the secure parent portal implementation.

## Security Architecture Changes

### Previous (Insecure) Approach
- Students could write directly to `/parentInvitations/{token}`
- Required giving authenticated users write access to create invitations
- No server-side validation of invitation data

### New (Secure) Approach
- Students write parent invitation requests to their own profile at `/students/{studentEmailKey}/parentInvitationRequest`
- Cloud function processes these requests and creates the actual invitations
- Only cloud functions have write access to `/parentInvitations/`

## Required Security Rules

```json
{
  "rules": {
    "students": {
      "$studentEmailKey": {
        // Allow students to write their own parent invitation requests
        "parentInvitationRequest": {
          ".read": "auth != null && ($studentEmailKey == auth.token.email.replace('.', ','))",
          ".write": "auth != null && ($studentEmailKey == auth.token.email.replace('.', ','))"
        },
        // ... other student rules ...
      }
    },
    
    "parentInvitations": {
      // Only allow reads for valid invitation tokens
      "$invitationToken": {
        ".read": "auth != null",
        ".write": false  // Only cloud functions can write
      }
    },
    
    "parents": {
      "$parentEmailKey": {
        // Allow parents to read/write their own data
        ".read": "auth != null && ($parentEmailKey == auth.token.email.replace('.', ','))",
        ".write": "auth != null && ($parentEmailKey == auth.token.email.replace('.', ','))",
        
        // Allow linked students to read parent info
        "linkedStudents": {
          "$studentEmailKey": {
            ".read": "auth != null && (
              $parentEmailKey == auth.token.email.replace('.', ',') ||
              $studentEmailKey == auth.token.email.replace('.', ',')
            )"
          }
        }
      }
    }
  }
}
```

## Key Security Improvements

1. **Principle of Least Privilege**: Students can only create invitation requests under their own profile
2. **Server-Side Validation**: Cloud functions validate all invitation data before creating actual invitations
3. **Token Generation**: Secure tokens are generated server-side, not client-side
4. **Access Control**: Only authenticated parents can accept invitations meant for their email
5. **Audit Trail**: All invitation requests and processing are logged

## Implementation Flow

1. Student submits registration with parent email
2. Client writes to `/students/{studentEmailKey}/parentInvitationRequest`
3. `processParentInvitationRequest` cloud function triggers
4. Function validates request and creates invitation at `/parentInvitations/{token}`
5. `sendParentInvitationOnCreate` triggers and sends email with link to `/parent-login?token=xyz`
6. Parent accesses dedicated login page, authenticates, and auto-links account via `acceptParentInvitation`

## Testing the New Flow

```bash
# Deploy the new functions
firebase deploy --only functions:processParentInvitationRequest,functions:sendParentInvitationOnCreate

# Or use emulators
firebase emulators:start --only functions,database
```

## Migration Notes

- Existing invitations will continue to work
- No changes needed to the parent setup flow
- The `sendParentInvitation` onCall function can be deprecated once confirmed working