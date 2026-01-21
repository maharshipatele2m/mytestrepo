# RAG File Selection & Google Permissions Display - Implementation Summary

## Changes Made

### 1. RAG File Selection Dropdown in Chat Interface

**Problem:** Previously, RAG was applied to all uploaded documents, which was costly and time-consuming.

**Solution:** Added an interactive dropdown selector in the chat interface when "My Docs" tool is active.

#### Frontend Changes:
- **ChatWindow.tsx**:
  - Added `documents` state to fetch and display available documents
  - Added `showRagSelector` state to toggle dropdown visibility
  - Created `toggleRagFile()` and `toggleAllRagFiles()` functions for file selection
  - Added dropdown UI component with checkboxes for each document
  - Selection persists in localStorage and syncs across sessions
  - Displays count of selected files (e.g., "3 documents selected")

#### UI Features:
- **Dropdown Toggle Button**: Shows current selection status
- **Checkbox List**: All uploaded documents with individual selection
- **Select All/Deselect All**: Quick toggle for all files
- **Empty State**: Helpful message when no documents are uploaded
- **Visual Feedback**: Selected files are checked and highlighted

#### Styling:
- Created `rag-dropdown.css` with modern, polished styles
- Dropdown appears above the input area
- Smooth animations with Framer Motion
- Consistent with existing design system

### 2. Backend RAG Filtering

**Changes:**
- **chatService.ts**: Updated `streamChat()` and `resolveToolCalls()` to accept `activeFileNames` parameter
- **route.ts** (chat API): Extracts `activeFileNames` from request and passes to `streamChat()`
- **dispatcher.ts**: Updated `dispatchToolCall()` to forward `activeFileNames` to search
- **pinecone.ts**: `searchDocuments()` now filters results by `activeFileNames` if provided

**Result:** Only selected documents are searched during RAG, saving:
- ✅ Embedding API costs
- ✅ Processing time
- ✅ Token usage
- ✅ Improved relevance (focused context)

### 3. Google Service Permissions Display

**Problem:** Users couldn't see what level of access (Read-Only vs Read-Write) their Google services had.

**Solution:** Display permission levels in service tooltips.

#### Backend Changes:
- **callback/route.ts**: 
  - Now captures OAuth scopes from tokens
  - Stores in `user_metadata.services_scopes`

- **status/route.ts**:
  - Analyzes stored scopes to determine permission level
  - Returns `permissions` object with status for each service:
    - `"Read-Write"` - Full access
    - `"Read-Only"` - Limited access
    - `"Not Connected"` - Service not connected

#### Frontend Changes:
- **ChatWindow.tsx**:
  - Updated `ServiceStatus` interface to include `permissions` object
  - Modified `ServiceIcon` component to display permission in tooltip
  - Color-coded permissions:
    - 🟢 Green (`#3fb950`) for Read-Write
    - 🟡 Amber (`#d29922`) for Read-Only
    - ⚪ Gray for Not Connected

#### Permission Detection Logic:
```typescript
gmail: hasScope('gmail.compose') ? 'Read-Write' : 'Read-Only'
calendar: hasScope('auth/calendar') ? 'Read-Write' : 'Read-Only'
drive: hasScope('drive.file') || hasScope('auth/drive') ? 'Read-Write' : 'Read-Only'
docs: hasScope('auth/documents') || hasScope('auth/drive') ? 'Read-Write' : 'Read-Only'
```

## User Experience

### RAG File Selection:
1. Click "My Docs" tool
2. Dropdown appears showing "Select documents for RAG"
3. Click to expand and see all uploaded documents
4. Check/uncheck files to include in RAG
5. Selection is saved automatically
6. Button shows "X documents selected"

### Permission Display:
1. Hover over any Google service icon (Gmail, Calendar, Drive, Docs)
2. Tooltip shows: `ServiceName: Read-Write` or `ServiceName: Read-Only`
3. Color indicates permission level
4. Click to connect/disconnect service

## Testing Notes

✅ Build successful with all changes
✅ TypeScript compilation passed
✅ All API routes updated correctly
✅ Frontend state management working
✅ CSS styles properly loaded

## Files Modified

1. `src/components/ChatWindow.tsx` - RAG selector UI + permission display
2. `src/components/RagManager.tsx` - File selection in Knowledge Base
3. `src/services/chatService.ts` - RAG filtering logic
4. `src/lib/mcp/dispatcher.ts` - Tool dispatch with file filtering
5. `src/lib/rag/pinecone.ts` - Vector search filtering
6. `src/app/api/chat/route.ts` - API parameter passing
7. `src/app/api/google/status/route.ts` - Permission analysis
8. `src/app/api/google/callback/route.ts` - Scope capture
9. `src/app/globals.css` - Selective RAG styles
10. `src/app/rag-dropdown.css` - New dropdown styles
11. `src/app/layout.tsx` - Import new CSS

## Next Steps for User

1. **Test RAG Selection**: 
   - Upload some documents in Knowledge Base
   - Switch to "My Docs" tool in chat
   - Select specific files from dropdown
   - Ask a question and verify only selected files are used

2. **Verify Permissions**:
   - Reconnect Google services (if already connected)
   - Hover over service icons to see permission levels
   - Verify Read-Write vs Read-Only status matches OAuth grants

3. **Monitor Costs**:
   - Check that embeddings are only generated for selected files
   - Verify Pinecone queries are filtered correctly
