# AgentOps Hub - Backend

Complete AI agent management platform with advanced features including agent memory, multi-format documents, YouTube integration, web search, and more.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
```

### 2. Setup Database
```bash
# Make sure PostgreSQL is running
# Database: agentops_hub

# Run migration for new features
python migrate_new_features.py

# Seed tools
python seed.py
```

### 3. Start Server
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: http://localhost:8000

## 📋 Testing

### Automated Testing
```bash
# Run complete test suite
python testing.py

# View results
cat report.md
```

### Manual Testing (Postman)
1. Import `COLLECTION-AGENTOPS.json` (API collection)
2. Import `VARIABLES-AGENTOPS.json` (environment)
3. Select "AgentOps Hub - Local Environment"
4. Run requests in order (variables auto-populate)

## ✨ Features

### Core Features
- 🔐 **Authentication** - JWT-based user authentication
- 🤖 **Agent Management** - Create and configure AI agents
- 📝 **Document Management** - Knowledge base with vector search
- ▶️ **Run Execution** - Execute agent tasks with streaming
- 🛠️ **Tool Registry** - Pluggable tools for agents

### New Features (v2.0)
- 🧠 **Conversations** - Agent memory across sessions
- 📄 **Multi-format Documents** - PDF, DOCX, Excel, CSV, Image
- 🖼️ **OCR** - Image text extraction (Tesseract)
- 📺 **YouTube** - Transcript extraction from videos
- 🌊 **Streaming** - Real-time run updates (SSE)
- 👁️ **Vision** - Infrastructure for vision capabilities
- 🔍 **Web Search** - DuckDuckGo integration

## 📁 Project Structure

```
backend/
├── app/
│   ├── ai/              # AI components
│   │   ├── agent_builder.py
│   │   ├── runner.py
│   │   ├── tool_registry.py
│   │   ├── vectorstore_qdrant.py
│   │   └── tools/
│   │       └── web_search.py (NEW)
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── agents.py
│   │       ├── documents.py
│   │       ├── runs.py
│   │       ├── tools.py
│   │       ├── conversations.py (NEW)
│   │       └── streaming.py (NEW)
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── exceptions.py
│   ├── db/
│   │   └── session.py
│   ├── models/
│   │   ├── user.py
│   │   ├── agent.py
│   │   ├── document.py
│   │   ├── run.py
│   │   ├── run_step.py
│   │   ├── tool.py
│   │   ├── conversation.py (NEW)
│   │   └── run_attachment.py (NEW)
│   ├── schemas/
│   │   ├── agent.py
│   │   ├── auth.py
│   │   ├── document.py
│   │   ├── run.py
│   │   ├── tool.py
│   │   ├── conversation.py (NEW)
│   │   └── run_step.py
│   ├── services/
│   │   ├── agent_service.py
│   │   ├── document_service.py
│   │   ├── run_service.py
│   │   ├── conversation_service.py (NEW)
│   │   ├── youtube_service.py (NEW)
│   │   └── parsers/ (NEW)
│   │       ├── pdf_parser.py
│   │       ├── docx_parser.py
│   │       ├── excel_parser.py
│   │       ├── csv_parser.py
│   │       └── image_parser.py
│   └── main.py
├── docs/
│   ├── plan.md
│   └── original-README.md
├── uploads/           # Uploaded files
├── migrate_new_features.py
├── seed.py
├── testing.py
├── report.md
├── COLLECTION-AGENTOPS.json
├── VARIABLES-AGENTOPS.json
├── requirements.txt
└── README.md
```

## 🗄️ Database Schema

### Tables
- `users` - User accounts
- `agents` - Agent configurations  
- `tools` - Tool registry
- `documents` - Knowledge base documents
- `runs` - Execution records
- `run_steps` - Detailed execution steps
- **`conversations`** (NEW) - Conversation sessions
- **`messages`** (NEW) - Conversation messages
- **`run_attachments`** (NEW) - Vision file attachments

### Key Relationships
- `runs.conversation_id` → `conversations.id`
- `conversations.agent_id` → `agents.id`
- `messages.conversation_id` → `conversations.id`
- `agents.tool_ids` → `tools.id[]`

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login (get JWT)

### Tools
- `GET /api/v1/tools` - List available tools

### Agents
- `POST /api/v1/agents` - Create agent
- `GET /api/v1/agents` - List agents
- `GET /api/v1/agents/{id}` - Get agent details
- `PUT /api/v1/agents/{id}` - Update agent
- `DELETE /api/v1/agents/{id}` - Delete agent

### Conversations (NEW)
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations` - List conversations
- `GET /api/v1/conversations/{id}` - Get conversation with messages
- `PATCH /api/v1/conversations/{id}` - Update conversation
- `DELETE /api/v1/conversations/{id}` - Delete conversation

### Documents
- `POST /api/v1/documents` - Upload text document
- `POST /api/v1/documents/upload` - Upload file (PDF/DOCX/Excel/CSV/Image)
- `POST /api/v1/documents/youtube` - Extract YouTube transcript (NEW)
- `GET /api/v1/documents` - List documents
- `GET /api/v1/documents/{id}` - Get document
- `DELETE /api/v1/documents/{id}` - Delete document

### Runs
- `POST /api/v1/runs` - Create run (with optional conversation_id)
- `GET /api/v1/runs` - List runs
- `GET /api/v1/runs/{id}` - Get run details
- `POST /api/v1/runs/{id}/cancel` - Cancel run

### Streaming (NEW)
- `GET /api/v1/streaming/runs/{id}` - Stream run execution (SSE)

## 📦 Dependencies

### Core
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM
- `pydantic` - Data validation
- `openai` - OpenAI API
- `qdrant-client` - Vector database

### New Features
- `pypdf2` - PDF parsing
- `python-docx` - Word document parsing
- `pandas` - Excel/CSV parsing
- `openpyxl` - Excel file support
- `pytesseract` - OCR (requires Tesseract)
- `Pillow` - Image processing
- `youtube-transcript-api` - YouTube transcripts
- `duckduckgo-search` - Web search

## 🧪 Test Results

**Latest Test Run:** 100% Pass Rate (14/14 tests)

See `report.md` for detailed test results and feature validation.

## 🔐 Environment Variables

Create `.env` file in backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/agentops_hub

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=agentops_vectors
```

## 📝 Usage Examples

### 1. Create Agent with Web Search
```python
import requests

headers = {"Authorization": f"Bearer {token}"}
agent = {
    "name": "Research Agent",
    "model": "gpt-4o",
    "system_prompt": "You are a research assistant with web search.",
    "temperature": 0.7,
    "tool_ids": [5]  # web_search tool
}
response = requests.post(
    "http://localhost:8000/api/v1/agents",
    json=agent,
    headers=headers
)
```

### 2. Create Conversation
```python
conversation = {
    "agent_id": 1,
    "title": "Research Session"
}
response = requests.post(
    "http://localhost:8000/api/v1/conversations",
    json=conversation,
    headers=headers
)
conversation_id = response.json()["id"]
```

### 3. Run with Memory
```python
run = {
    "agent_id": 1,
    "input_text": "What are the latest AI trends?",
    "conversation_id": conversation_id
}
response = requests.post(
    "http://localhost:8000/api/v1/runs",
    json=run,
    headers=headers
)
```

### 4. Upload YouTube Transcript
```python
youtube = {
    "agent_id": 1,
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "include_timestamps": True
}
response = requests.post(
    "http://localhost:8000/api/v1/documents/youtube",
    json=youtube,
    headers=headers
)
```

## 🚧 Known Limitations

1. **OCR**: Requires Tesseract installation (`choco install tesseract` on Windows)
2. **Streaming**: Best tested with curl or EventSource client, not Postman
3. **File Uploads**: Large files may require timeout adjustments
4. **Rate Limiting**: Not implemented (consider for production)

## 🤝 Contributing

1. Follow existing code structure
2. Add tests for new features
3. Update documentation
4. Run `testing.py` before committing

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions, please check:
- `report.md` - Complete test results
- `docs/` - Additional documentation
- API docs - http://localhost:8000/docs (when server is running)

---

**Version:** 2.0  
**Last Updated:** December 7, 2025  
**Test Status:** ✅ 100% Pass Rate
