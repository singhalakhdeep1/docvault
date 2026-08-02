# DocVault - Implementation

## Overview
This document describes the search and editor integrations added to DocVault.

## Technologies Added

### 1. Elasticsearch
- Document indexing
- Full-text search
- Document CRUD operations
- Bulk operations
- Highlight search results

### 2. Typesense
- Collection management
- Fast typo-tolerant search
- Document operations
- Schema configuration

### 3. Algolia
- Real-time search
- Document indexing
- Search with parameters
- Index settings
- Bulk operations

### 4. Tiptap
- Rich text editor
- Formatting toolbar
- Code blocks with syntax highlighting
- Image and link support
- Placeholder text

### 5. ProseMirror
- Customizable editor
- Schema-based editing
- Transaction-based updates
- Keymap support

## Files Created

### Search Services
- `apps/api/src/elasticsearch/client.ts` - Elasticsearch client
- `apps/api/src/typesense/client.ts` - Typesense client
- `apps/api/src/algolia/client.ts` - Algolia client

### Editor Components
- `apps/web/src/components/editor/TiptapEditor.tsx` - Tiptap editor component
- `apps/web/src/components/editor/ProseMirrorEditor.tsx` - ProseMirror editor component

## Features

### Elasticsearch Service
- Index documents with custom IDs
- Full-text search with queries
- Get, update, delete documents
- Create indices with mappings
- Bulk indexing
- Search with highlighting
- Connection testing

### Typesense Service
- Index documents in collections
- Search with typo tolerance
- Document CRUD operations
- Create/delete collections
- Schema configuration
- Connection testing

### Algolia Service
- Index documents with object IDs
- Real-time search
- Search with parameters
- Document CRUD operations
- Bulk indexing
- Clear index
- Update settings
- Connection testing

### Tiptap Editor
- Rich text editing with StarterKit
- Formatting toolbar (bold, italic, strike, code)
- Headings (H1, H2)
- Lists (bullet, ordered)
- Code blocks with syntax highlighting
- Blockquotes
- Horizontal rules
- Undo/redo
- Placeholder support
- Content change callbacks

### ProseMirror Editor
- Schema-based editing
- Transaction-based updates
- Basic keymap
- Content change callbacks
- Placeholder support
- Custom schema configuration

## Installation Required

Add to `apps/api/package.json`:
```json
{
  "dependencies": {
    "@elastic/elasticsearch": "^8.11.0",
    "typesense": "^5.0.0",
    "algoliasearch": "^4.20.0"
  }
}
```

Add to `apps/web/package.json`:
```json
{
  "dependencies": {
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    "@tiptap/extension-placeholder": "^2.1.0",
    "@tiptap/extension-image": "^2.1.0",
    "@tiptap/extension-link": "^2.1.0",
    "@tiptap/extension-code-block-lowlight": "^2.1.0",
    "lowlight": "^3.0.0",
    "prosemirror-state": "^1.4.3",
    "prosemirror-view": "^1.32.0",
    "prosemirror-model": "^1.19.0",
    "prosemirror-schema-basic": "^1.2.2",
    "prosemirror-example-setup": "^1.2.2",
    "prosemirror-keymap": "^1.2.2",
    "prosemirror-commands": "^1.5.0"
  }
}
```

Run:
```bash
cd apps/api && npm install
cd apps/web && npm install
```

## Environment Variables

```env
# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# Typesense
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=xyz

# Algolia
ALGOLIA_APP_ID=your-app-id
ALGOLIA_API_KEY=your-api-key
```

## Notes
- All code is written but packages are not installed (per user request)
- Requires running instances of Elasticsearch, Typesense, and Algolia
- Tiptap and ProseMirror are React components for the web app
- Both editors support rich text editing with different approaches
