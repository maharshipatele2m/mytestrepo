# Google Drive & Docs Integration - Scope Fix

## Issue Identified
The Google OAuth scopes were set to **readonly** which prevented document creation:
- ❌ `https://www.googleapis.com/auth/drive.readonly`
- ❌ `https://www.googleapis.com/auth/documents.readonly`

## Fix Applied
Updated scopes in `src/app/api/google/connect/route.ts` to allow **write access**:
- ✅ `https://www.googleapis.com/auth/drive.file` - Allows creating/editing files created by the app
- ✅ `https://www.googleapis.com/auth/documents` - Full access to Google Docs

## Current Scope Configuration
```typescript
const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive.file',        // ← UPDATED
    'https://www.googleapis.com/auth/documents'          // ← UPDATED
];
```

## What the `createDoc` Function Does
Located in `src/lib/mcp/google.ts`, it:

1. **Creates/Finds Folder**: Ensures "MCP Chatbot" folder exists in My Drive
2. **Creates Document**: Creates a new Google Doc with the specified title
3. **Moves to Folder**: Moves the document from root to "MCP Chatbot" folder
4. **Inserts Content**: Adds the content to the document
5. **Returns Details**: 
   - Document ID
   - Title
   - Folder name
   - Location path
   - Web view link

## Testing Instructions

### Step 1: Re-authenticate
Since scopes changed, you need to **disconnect and reconnect** your Google account:

1. Open the app at `http://localhost:3000`
2. Click your profile → "Disconnect Google"
3. Click "Connect Google Services"
4. Grant the new permissions

### Step 2: Test Document Creation
Send this message in the chat:

```
Write a blog post about the importance of SEO and save it to my Google Drive
```

### Expected Result
The AI should:
1. Generate SEO blog content
2. Call `google_docs_create` tool
3. Create document in "MCP Chatbot" folder
4. Return:
   - ✅ Document title
   - ✅ Location: "My Drive → MCP Chatbot"
   - ✅ Document ID
   - ✅ Direct link to the document

### Step 3: Verify
1. Open Google Drive
2. Navigate to "My Drive → MCP Chatbot"
3. You should see your document there
4. Click to verify content

## Scope Permissions Explained

| Scope | Permission | Why We Need It |
|-------|-----------|----------------|
| `drive.file` | Create/edit files created by this app | To save documents to Drive |
| `documents` | Full Google Docs access | To create and edit documents |
| `calendar` | Full calendar access | To create/view events |
| `gmail.readonly` | Read emails | To list/search emails |
| `gmail.compose` | Send emails | To compose/send emails |

## Important Notes

1. **Security**: `drive.file` only allows access to files created by the app, not all Drive files
2. **Re-auth Required**: Users must disconnect and reconnect after scope changes
3. **Folder Organization**: All created documents go to "MCP Chatbot" folder for easy management

## Status
✅ Scopes updated
✅ Server restarted
⏳ Waiting for user to re-authenticate and test
