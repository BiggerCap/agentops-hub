# AgentOps Hub - Frontend

The Next.js frontend for AgentOps Hub, an AI agent orchestration platform with real-time streaming, RAG capabilities, and modern UI/UX.

## ✨ Features

- 🤖 **Agent Management** - Create, configure, and manage AI agents with custom tools
- 💬 **Conversation Interface** - Multi-turn conversations with agent memory
- 📊 **Run Execution Viewer** - Real-time streaming of agent execution with SSE
- 📚 **Knowledge Base** - Upload documents (PDF, DOCX, Excel, CSV, Images) and YouTube transcripts
- 🎨 **Modern UI** - Built with shadcn/ui components and Radix UI primitives
- 🌓 **Light/Dark Mode** - Persistent theme with smooth transitions
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- 🔐 **Authentication** - JWT-based authentication with protected routes
- ⚡ **Optimized** - Built on Next.js 16 with App Router and React Server Components

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL if backend is not on http://127.0.0.1:8000

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

## 📋 Prerequisites

- Node.js 18+ 
- Backend API running (see [backend README](../backend/README.md))
- PostgreSQL and Qdrant databases running (via docker-compose)

## 🔧 Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

This tells the frontend where to find the backend API.

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and design tokens
│   ├── layout.tsx           # Root layout with theme provider
│   ├── page.tsx             # Landing page
│   ├── app/                 # Protected application routes
│   │   ├── layout.tsx       # App layout with sidebar navigation
│   │   ├── page.tsx         # Dashboard
│   │   ├── agents/          # Agent management pages
│   │   ├── conversations/   # Conversation/chat pages
│   │   ├── runs/            # Run execution viewer pages
│   │   ├── kb/              # Knowledge base pages
│   │   └── settings/        # Settings pages
│   ├── login/               # Login page
│   └── signup/              # Signup page
├── components/
│   ├── agents/              # Agent-related components
│   ├── auth/                # Authentication components
│   ├── kb/                  # Knowledge base components
│   │   ├── upload-dialog.tsx
│   │   └── youtube-dialog.tsx
│   ├── landing/             # Landing page sections
│   ├── layout/              # Layout components (sidebar, header)
│   ├── runs/                # Run execution components
│   ├── theme-provider.tsx   # Theme context provider
│   ├── theme-toggle.tsx     # Light/dark mode switch
│   └── ui/                  # shadcn/ui base components
├── lib/
│   ├── apiClient.ts         # Axios HTTP client with interceptors
│   ├── authContext.tsx      # Authentication state management
│   ├── types.ts             # TypeScript type definitions
│   └── utils.ts             # Utility functions
└── ...
```

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with new features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **Radix UI** - Unstyled, accessible component primitives
- **next-themes** - Theme management with persistence
- **Axios** - HTTP client for API requests
- **React Hook Form** - Performant form management
- **Zod** - Schema validation
- *Main README](../README.md) - Project overview and architecture
- [Backend README](../backend/README.md) - Backend API documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 📝 Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔗 API Integration

The frontend communicates with the backend API via Axios. The API client is configured in `src/lib/apiClient.ts` with:

- Automatic JWT token injection from localStorage
- Request/response interceptors
- Error handling
- Base URL configuration from environment variables

## 🎨 Styling & Theming

All styling is globally configurable via `src/app/globals.css`:

- CSS variables for colors (OKLCH color space)
- Consistent spacing scale
- Global animation durations
- Dark/light mode support
- Tailwind utility classes

Components use Tailwind utilities that reference these global design tokens, ensuring consistency across the application.eal-time message updates

### Run Execution
- Execute agent tasks/runs
- Real-time streaming with Server-Sent Events (SSE)
- Step-by-step execution visualization
- View tool calls and results
- Display run attachments (web search results)
- Run status tracking (queued, running, completed, failed)

### Knowledge Base
- Upload documents (PDF, DOCX, Excel, CSV, Images)
- YouTube transcript extraction
- Document list and management
- Chunk count display
- Integration with agent RAG capabilities

### UI/UX
- Modern, clean interface
- Dark/light mode toggle
- Responsive design (mobile, tablet, desktop)
- Loading states and error handling
- Toast notifications for user feedback
- Form validation

## 📚 Documentation

- [Design System Guide](./DESIGN_SYSTEM.md) - Complete theming and customization docs
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 🎨 Design Philosophy

This project demonstrates a **centralized design system** where:

1. **All colors** are defined as CSS variables (OKLCH color space)
2. **All spacing** follows a consistent scale
3. **All animations** use global duration variables
4. **All components** reference global tokens via Tailwind utilities

Change once, apply everywhere. No hard-coded values in components.

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

MIT License - See [LICENSE](../LICENSE) file for details.

---

**Part of AgentOps Hub** - A full-stack AI agent orchestration platform run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your own needs!

## 📄 License

MIT
