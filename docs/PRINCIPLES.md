# Architectural Principles

## Progressive Enhancement ✅

**Principle:** All pages are fully functional without client-side JavaScript.

- [x] Nunjucks templates render complete, valid HTML
- [x] GOV.UK Frontend components work server-rendered
- [x] Forms submittable without JavaScript
- [x] Links navigate via standard HTTP GET/POST
- [x] Client scripts enhance experience (e.g., GOV.UK collapsible details, islands)
- [x] Critical content visible before JS loads

**Why:** Improves accessibility, improves performance, handles JS failures gracefully.

---

## Server-First Rendering ✅

**Principle:** Default rendering strategy is on the server; client enhancements are optional.

- [x] NestJS is the central controller (single framework, no meta-framework)
- [x] Nunjucks templates render on each request
- [x] React used only for SSR, not for client-side app routing
- [x] React islands optional, not required for base functionality
- [x] Session state managed server-side
- [x] Validation and business logic on server

**Why:** Simpler architecture, reduced complexity, clearer data flow, better accessibility, better performance, better SEO, better cacheability

---

## No Client-Side Routing ✅

**Principle:** No single-page application (SPA) or client-side router.

- [x] No `react-router`, TanStack Router, or equivalent
- [x] No `wouter` or other routing libraries
- [x] Links are standard `<a>` tags with hrefs
- [x] Navigation causes full page reloads (or HTMX-like partial updates in future)
- [x] Each route handled by NestJS controller
- [x] Session preserved across navigations via cookies

**Why:** Reduces complexity, improves accessibility, better cacheability, better browser navigation semantics, cleaner URLs.

---

## GOV.UK Frontend Components ✅

**Principle:** Use GOV.UK Frontend CSS and macros directly; do not re-implement components in React.

- [x] GOV.UK Frontend npm package installed and imported
- [x] CSS pre-compiled and served from static assets
- [x] Nunjucks macros used in `.njk` templates
- [x] React components apply GOV.UK CSS classes (no custom re-implementation)
- [x] `initAll()` called on client to activate JS components
- [x] No custom button, input, or card components

**Why:** Consistency with GDS standards, reduced maintenance, easier compliance, better accessibility.

---

## React SSR Without Hydration ✅

**Principle:** React components rendered on server as strings; no client-side rehydration or hydration mismatch issues.

- [x] `ReactSSRService.render()` uses `renderToString()`
- [x] Output is HTML string, not React element
- [x] HTML injected into Nunjucks template (marked `| safe`)
- [x] No client-side React instances for SSR components
- [x] No prop passing from server to client (except via islands)
- [x] SSR components are pure presentation (no hooks)

**Why:** Reduces bundle size, eliminates hydration errors, clearer separation of concerns, provides composability and DX benefits of React without client-side / SPA downsides

---

## React Islands for Interactivity ✅

**Principle:** Interactive components are independent React islands, not a full app.

- [x] Each island is a separate ESM bundle
- [x] Islands communicate via HTML data attributes
- [x] `renderIslandMount()` generates mount points with safe prop serialization
- [x] Client entry scans for `[data-island]` elements
- [x] Islands lazy-loaded via dynamic `import()`
- [x] Each island has its own React root
- [x] Islands don't replace or duplicate existing forms
- [x] No shared state between islands

**Why:** Support for complex client-side interactions when required, progressive enhancement, small individual bundles.

---

## Typed Configuration ✅

**Principle:** All environment configuration is type-safe and validated.

- [x] Configuration in `src/config/configuration.ts`
- [x] TypeScript types applied to all config values
- [x] Environment variables with sensible defaults
- [x] `.env.example` documented with all required variables
- [x] ConfigModule makes config globally available
- [x] No magic strings or untyped access

**Why:** Prevents runtime errors, improves DX, self-documenting.

---

## Validation Pipe + Error Handling ✅

**Principle:** Input validation is global and consistent; errors render user-friendly responses.

- [x] Global `ValidationPipe` enabled in NestJS
- [x] DTOs use `class-validator` decorators
- [x] Invalid requests caught and transformed to HTTP exceptions
- [x] `HttpExceptionFilter` renders error.njk template
- [x] Validation errors include field names and messages
- [x] Session can store errors for form re-render

**Why:** Consistent error handling, prevents invalid state, improves security.

---

## Session Management ✅

**Principle:** Request-scoped state and form errors stored in session.

- [x] Express session middleware configured
- [x] Session cookie set automatically on all requests
- [x] Custom interface: `SessionData` with `validationErrors`
- [x] Errors stored as `{ step, errors }` structure
- [x] Controllers can read/write session
- [x] Session secret from environment

**Why:** Maintains state across requests, enables multi-step forms, tracks form errors.

---

## Static Asset Strategy ✅

**Principle:** All client assets (CSS, fonts, images) served as immutable static files.

- [x] GOV.UK Frontend CSS, fonts, images copied to public/
- [x] Assets served under `/assets/` path
- [x] Assets fingerprinted or cache-busted (future)
- [x] No dynamic CSS generation
- [x] Client bundles (islands) also served as static files

**Why:** CDN-friendly, cacheable, faster delivery.

---

## esbuild Bundling ✅

**Principle:** Client code bundled with esbuild; no webpack, Vite, or alternatives.

- [x] Single esbuild configuration in `scripts/build-islands.ts`
- [x] Entry points: `client/entry.ts` + `client/islands/**/mount.tsx`
- [x] Output: ES modules to `public/js/`
- [x] Separate bundles for entry and each island
- [x] Development: Sourcemaps enabled
- [x] Production: Minified

**Why:** Fast builds, small output, minimal configuration.

---

## TypeScript Strict Mode ✅

**Principle:** Strict TypeScript compilation throughout.

- [x] `"strict": true` in tsconfig.json
- [x] All code type-safe (no `any` unless necessary)
- [x] No implicit `any`
- [x] No unchecked array access
- [x] All union types narrowed explicitly

**Why:** Catches errors at compile time, improves documentation, cleaner code.

---

## No Hydration Mismatch ✅

**Principle:** Server and client render independently; no attempt to "hydrate" React.

- [x] SSR components not rehydrated on client
- [x] Islands use `createRoot()` not `hydrateRoot()`
- [x] No attempts to match SSR HTML with client render
- [x] Server-rendered content left alone by client

**Why:** Eliminates entire class of bugs, simpler mental model, clearer separation.

---

## Summary

Adheres to **server-first, progressively enhanced, type-safe** principles. The architecture favors:

- **Simplicity** over features
- **Predictability** over flexibility
- **Standard patterns** over novel approaches
- **Security** by default
- **Accessibility** as first-class concern
- **Performance** through reduced complexity
