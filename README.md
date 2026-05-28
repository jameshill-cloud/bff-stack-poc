# HMCTS Small Claims Application Portal - Phase 1 Bootstrap

A minimal Backend-for-Frontend (BFF) proof-of-concept demonstrating a modern, GDS-compliant technology stack.

## Prerequisites

- Node.js ≥ 20 LTS
- npm ≥ 10

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server (runs NestJS, esbuild, and JSON Server)
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Architecture

This phase implements a **server-first, progressively enhanced** architecture:

### NestJS Backend-for-Frontend

- **Express adapter** with Nunjucks templating
- **Session middleware** for request-scoped state
- **Global pipes** for validation and transformation
- **Exception filters** for error handling

### Nunjucks Server-Side Rendering

- Uses GOV.UK Frontend Nunjucks macros and precompiled CSS
- All pages render server-first without JavaScript
- ALPHA phase banner on every page
- Custom `govukErrors` filter for form validation

### React Server-Side Rendering (SSR)

- React components rendered to strings via `renderToString`
- Injected as pre-rendered HTML into Nunjucks templates
- No hydration or client-side rehydration
- Components use GOV.UK Frontend CSS classes directly

### React Islands

- Small React components that optionally mount interactively
- Independent bundles with esbuild
- Lazy-loaded via dynamic imports on the client
- Communicate via HTML data attributes (`data-island`, `data-props`)
- Not required for page functionality (progressive enhancement)

### esbuild Pipeline

- Client entry point: `client/entry.ts` initializes GOV.UK components and mounts islands
- Island bundles: Each `client/islands/**/mount.tsx` compiled separately
- Outputs to `public/js/` for serving as static assets
- Development: Watch mode with sourcemaps
- Production: Minified, no sourcemaps

### Mock API

- Runs on port 3001 via **JSON Server**
- Health check endpoint: `GET /health`
- Routes defined in `mock-api/routes.json`
- Data stored in `mock-api/db.json`

## NPM Scripts

| Command                       | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `npm run dev`                 | Start dev stack: NestJS watch + islands watch + mock API |
| `npm run build`               | Compile NestJS + build islands + copy assets             |
| `npm run start`               | Run production build                                     |
| `npm run copy-assets`         | Copy GOV.UK Frontend CSS, fonts, images to public/assets |
| `npm run build:islands`       | Build island bundles (one-off)                           |
| `npm run build:islands:watch` | Watch and rebuild islands on changes                     |
| `npm run mock-api`            | Start JSON Server (included in `dev`)                    |
| `npm test`                    | Run Jest tests                                           |
| `npm run lint`                | Run ESLint                                               |
| `npm run format`              | Format code with Prettier                                |

## Project Structure

```
src/
├── main.ts              # NestJS bootstrap, Nunjucks config
├── app.module.ts        # Root module
├── app.controller.ts    # Routes
├── app.service.ts       # Business logic
├── config/
│   └── configuration.ts # Typed config from env
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── middleware/
│   │   └── session.middleware.ts
│   └── helpers/
│       └── validation-errors.helper.ts
└── react/
    ├── ssr/
    │   ├── react-ssr.service.ts    # renderToString wrapper
    │   └── components/
    │       └── ExampleServerComponent.tsx
    └── islands/
        └── ExampleIsland/
            └── ExampleIsland.tsx

views/
├── layouts/
│   └── base.njk         # HTML skeleton, GOV.UK header/footer
├── partials/
│   ├── header.njk
│   ├── footer.njk
│   ├── phase-banner.njk
│   └── error-summary.njk
├── home.njk
└── error.njk

client/
├── entry.ts             # Initializes GOV.UK and mounts islands
└── islands/
    └── ExampleIsland/
        └── mount.tsx    # Island hydration

public/
├── assets/              # GOV.UK Frontend CSS, fonts, images (generated)
└── js/                  # Compiled bundles (generated)

mock-api/
├── db.json              # JSON Server data
└── routes.json          # JSON Server routing

scripts/
├── copy-assets.ts       # Copy GOV.UK Frontend assets
└── build-islands.ts     # esbuild orchestration
```

## Environment Variables

Copy `.env.example` to `.env` and adjust:

```env
PORT=3000                                    # NestJS port
MOCK_API_BASE_URL=http://localhost:3001     # Mock API endpoint
SESSION_SECRET=dev-secret-change-me         # Session encryption
NODE_ENV=development                        # development or production
```

## Technology Stack

| Concern       | Technology                        |
| ------------- | --------------------------------- |
| Runtime       | Node.js 20+ LTS                   |
| Framework     | NestJS (Express adapter)          |
| View Engine   | Nunjucks                          |
| UI Components | GOV.UK Frontend v5                |
| React         | React 18 (SSR only, no hydration) |
| Bundler       | esbuild                           |
| Mock API      | JSON Server 0.17.4                |
| Language      | TypeScript (strict mode)          |
| Testing       | Jest + Supertest                  |
| Linting       | ESLint + Prettier                 |

## Key Design Decisions

### ✅ Server-First, Progressive Enhancement

- All pages fully functional without JavaScript
- Client scripts enhance interactivity only
- GOV.UK Frontend components initialize on client

### ✅ React SSR, No Hydration

- React components rendered once to strings on the server
- HTML injected into Nunjucks templates
- No rehydration or client-side React instances
- Reduces bundle size and improves performance

### ✅ React Islands for Interactivity

- Independent interactive components
- Lazy-loaded only when needed
- Each island is its own ESM module
- Communicate via HTML data attributes

### ✅ Single BFF Framework

- NestJS is the sole controller
- No Next.js, Remix, or meta-framework
- Direct control over rendering flow

### ✅ No Client-Side Router

- Traditional multipage navigation
- Full page loads (or partial via fetch + Nunjucks)
- Simpler, more predictable behavior

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- react-ssr.service.spec

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

Tests include:

- **Unit**: ReactSSRService rendering
- **E2E**: GET / returns valid GOV.UK HTML, includes SSR content, includes islands

## Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Run the production server:
   ```bash
   npm run start
   ```

The application will start on the port defined in `.env` (default 3000).

**Note:** The mock API (JSON Server) is separate and not included in the production build. For a real API, replace `MOCK_API_BASE_URL` with your actual backend endpoint.

## Next Steps (Future Phases)

- Implement application form journey
- Add real data persistence layer
- Integrate with actual HMCTS services
- Add authentication and authorization
- Implement accessibility testing
- Performance optimization (caching, CDN)
- Load testing and scalability improvements

## Support and Documentation

- [NestJS Docs](https://docs.nestjs.com)
- [GOV.UK Frontend](https://frontend.design-system.service.gov.uk)
- [React SSR](https://react.dev/reference/react-dom/server)
- [esbuild](https://esbuild.github.io)
- [JSON Server](https://github.com/typicode/json-server)

---

**Phase 1** establishes the foundational infrastructure. It is not a complete application but a working scaffold demonstrating architecture patterns and technology integration.
