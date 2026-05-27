# HMCTS Small Claims Application Portal — Phase 1 Bootstrap Scaffold Specification

---

# 1. Project Overview

## Purpose

A proof-of-concept Backend-for-Frontend (BFF) web application for HMCTS digital services, demonstrating a modern, GDS-compliant technology stack.

This phase establishes:

- NestJS application bootstrap
- Nunjucks server rendering
- GOV.UK Frontend integration
- JSON Server mock API
- esbuild-based frontend bundling
- foundational project structure
- session middleware
- typed configuration
- React SSR infrastructure
- React island infrastructure

This phase does **not** implement the application journey, applications list, dashboard pages, or business logic.

---

# 2. Technology Stack

## Core

| Concern              | Technology                                         | Notes                                                 |
| -------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| Runtime              | Node.js ≥ 20 LTS                                   |                                                       |
| Framework            | **NestJS** (latest stable)                         | `@nestjs/cli` scaffold base; Express adapter          |
| Primary templating   | **Nunjucks**                                       | Configured directly via `nunjucks` npm package        |
| CSS / UI components  | **GOV.UK Frontend v5.x** (`govuk-frontend`)        | Use GOV.UK Nunjucks macros and precompiled CSS bundle |
| Mock API             | **JSON Server**                                    | Separate process on port 3001                         |
| React (SSR)          | **React 18** + `react-dom/server` `renderToString` | Server-only                                           |
| React (islands)      | **React 18** client bundle                         | Loaded only for islands                               |
| Client bundler       | **esbuild**                                        | No webpack                                            |
| Language             | **TypeScript** strict mode throughout              |                                                       |
| Validation           | **class-validator** + **class-transformer**        |                                                       |
| Testing              | **Jest** + **Supertest**                           |                                                       |
| Linting / formatting | **ESLint** + **Prettier**                          |                                                       |

## [DECISION] React is invoked directly from NestJS — no Next.js, Remix, or other meta-framework

`ReactSSRService` calls `renderToString` directly. NestJS remains the single controlling framework.

## [DECISION] No client-side router of any kind

Do not include `react-router`, `wouter`, TanStack Router, or any equivalent.

## [DECISION] GOV.UK Frontend components are not re-implemented in React

React components apply GOV.UK Frontend CSS class names directly in JSX where needed.

---

# 3. Repository Structure

Generate the following repository structure and scaffold all listed files unless otherwise noted.

```text
/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── config/
│   │   └── configuration.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── middleware/
│   │   │   └── session.middleware.ts
│   │   └── helpers/
│   │       └── validation-errors.helper.ts
│   ├── react/
│   │   ├── react.module.ts
│   │   ├── ssr/
│   │   │   ├── react-ssr.service.ts
│   │   │   ├── components/
│   │   │   │   └── ExampleServerComponent.tsx
│   │   │   └── index.ts
│   │   └── islands/
│   │       ├── island-loader.ts
│   │       └── ExampleIsland/
│   │           ├── ExampleIsland.tsx
│   │           └── index.ts
├── views/
│   ├── layouts/
│   │   └── base.njk
│   ├── partials/
│   │   ├── header.njk
│   │   ├── footer.njk
│   │   ├── phase-banner.njk
│   │   └── error-summary.njk
│   ├── home.njk
│   └── error.njk
├── client/
│   ├── entry.ts
│   └── islands/
│       └── ExampleIsland/
│           └── mount.tsx
├── public/
│   ├── assets/
│   └── js/
├── mock-api/
│   ├── db.json
│   └── routes.json
├── scripts/
│   ├── build-islands.ts
│   └── copy-assets.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── react/
│       └── react-ssr.service.spec.ts
├── types/
│   └── express.d.ts
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

# 4. NestJS Application Setup

## Bootstrap (`main.ts`)

Implement all of the following:

- Use Express adapter (default — do not use Fastify)
- Configure Nunjucks as view engine via `nunjucks.configure`
- Nunjucks search paths:
  - `views/`
  - `node_modules/govuk-frontend/dist`
- Enable `autoescape: true`
- Serve `public/` as static assets under `/`
- Register `express-session` middleware
- Register global `ValidationPipe` with:
  - `whitelist: true`
  - `transform: true`
- Register global `HttpExceptionFilter`
- Start on `PORT` from config (default `3000`)

## Session middleware (`session.middleware.ts`)

```typescript
import session from "express-session";

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET ?? "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
});
```

## Session type (`types/express.d.ts`)

```typescript
declare module "express-session" {
  interface SessionData {
    validationErrors?: {
      step: string;
      errors: Record<string, unknown>;
    };
  }
}
```

## Environment Variables (`.env.example`)

```env
PORT=3000
MOCK_API_BASE_URL=http://localhost:3001
SESSION_SECRET=dev-secret-change-me
NODE_ENV=development
```

---

# 5. Nunjucks Configuration

## Requirements

- Search paths:
  - `views/`
  - `node_modules/govuk-frontend/dist`
- `autoescape: true`
- Add a custom Nunjucks global function:
  - `govukErrors(errors, fieldName)`

All templates must extend `views/layouts/base.njk`.

## `base.njk`

Implement:

```nunjucks
<!DOCTYPE html>
<html lang="en" class="govuk-template">
<head>
  <meta charset="utf-8">
  <title>{{ pageTitle }} – Small Claims Portal – GOV.UK</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/govuk-frontend.min.css">
</head>
<body class="govuk-template__body">
  <script>document.body.classList.add('js-enabled');</script>

  {% include "partials/header.njk" %}

  <div class="govuk-width-container">
    {% include "partials/phase-banner.njk" %}
    {% block beforeContent %}{% endblock %}
    <main class="govuk-main-wrapper" id="main-content">
      {% block content %}{% endblock %}
    </main>
  </div>

  {% include "partials/footer.njk" %}

  <script type="module" src="/js/entry.js" defer></script>
  {% block islandScripts %}{% endblock %}
</body>
</html>
```

## Additional Requirements

- Use GOV.UK Frontend Nunjucks macros correctly
- Include an ALPHA phase banner on every page
- Render a basic `home.njk` page
- Implement a simple `/` route rendering the home page

---

# 6. React SSR Infrastructure

## `ReactSSRService`

Implement exactly:

```typescript
import { Injectable } from "@nestjs/common";
import { renderToString } from "react-dom/server";
import { createElement, ComponentType } from "react";

@Injectable()
export class ReactSSRService {
  render<P extends object>(component: ComponentType<P>, props: P): string {
    return renderToString(createElement(component, props));
  }
}
```

## Example SSR Component

Generate:

```text
src/react/ssr/components/ExampleServerComponent.tsx
```

Requirements:

- Pure rendering function
- Uses GOV.UK Frontend CSS classes
- No client-side interactivity
- Demonstrates server-rendered React HTML injection

---

# 7. React Island Infrastructure

## Island Loader (`src/react/islands/island-loader.ts`)

Implement exactly:

```typescript
export interface IslandManifest {
  mountId: string;
  bundle: string;
  props: unknown;
}

export function renderIslandMount(manifest: IslandManifest): string {
  const safeProps = JSON.stringify(manifest.props)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");

  return `<div id="${manifest.mountId}" data-island="${manifest.bundle}" data-props='${safeProps}'></div>`;
}
```

## Island Bootstrapper (`client/entry.ts`)

Implement exactly:

```typescript
import { initAll } from "govuk-frontend";

initAll();

document.querySelectorAll<HTMLElement>("[data-island]").forEach(async (el) => {
  const bundle = el.dataset.island;
  const props = JSON.parse(el.dataset.props ?? "{}");

  if (!bundle) return;

  const bundleUrl = new URL(bundle, window.location.origin).href;
  const mod = await import(/* @vite-ignore */ bundleUrl);

  mod.default(el, props);
});
```

## Example Island

Generate a working example island:

```text
src/react/islands/ExampleIsland/ExampleIsland.tsx
client/islands/ExampleIsland/mount.tsx
```

Requirements:

- React island mounts successfully
- Demonstrates progressive enhancement
- Uses GOV.UK styling classes
- Does not create or replace a `<form>`
- Works independently from the global entry bundle

---

# 8. Mock API (JSON Server)

## Requirements

Install `json-server` version exactly:

```json
"json-server": "0.17.4"
```

## Development Command

```bash
json-server --watch mock-api/db.json --port 3001 --routes mock-api/routes.json
```

## `mock-api/routes.json`

```json
{
  "/health": "/health"
}
```

## `mock-api/db.json`

Generate realistic scaffold data:

```json
{
  "health": [
    {
      "id": 1,
      "status": "ok"
    }
  ]
}
```

---

# 9. Scripts and Build

## `scripts/copy-assets.ts`

[SCAFFOLD] Implement a script that copies:

- `govuk-frontend.min.css`
- `fonts/`
- `images/`

from:

```text
node_modules/govuk-frontend/dist/
```

into:

```text
public/assets/
```

## `scripts/build-islands.ts`

Implement exactly:

```typescript
import * as esbuild from "esbuild";
import { glob } from "glob";

const watch = process.argv.includes("--watch");
const production = process.env.NODE_ENV === "production";

const entryPoints = glob.sync([
  "client/entry.ts",
  "client/islands/**/mount.tsx",
]);

const buildOptions: esbuild.BuildOptions = {
  entryPoints,
  bundle: true,
  outdir: "public/js",
  entryNames: "[dir]/[name]",
  outbase: "client",
  format: "esm",
  target: "es2020",
  minify: production,
  sourcemap: !production,
};

(async () => {
  if (watch) {
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log("Watching bundles...");
  } else {
    await esbuild.build(buildOptions);
    console.log("Bundles built.");
  }
})();
```

---

# 10. package.json Scripts

Implement exactly:

```json
{
  "scripts": {
    "build": "npm run copy-assets && nest build && ts-node scripts/build-islands.ts",
    "build:islands": "ts-node scripts/build-islands.ts",
    "build:islands:watch": "ts-node scripts/build-islands.ts --watch",
    "copy-assets": "ts-node scripts/copy-assets.ts",
    "start": "node dist/main",
    "dev": "concurrently --kill-others-on-fail false \"npm run copy-assets\" \"npm run build:islands:watch\" \"nest start --watch\" \"npm run mock-api\"",
    "mock-api": "json-server --watch mock-api/db.json --port 3001 --routes mock-api/routes.json",
    "test": "jest",
    "lint": "eslint \"{src,client}/**/*.{ts,tsx}\"",
    "format": "prettier --write \"{src,client,views}/**/*.{ts,tsx,njk}\""
  }
}
```

---

# 11. Testing Requirements

Generate a minimal set of meaningful, passing tests.

## `test/app.e2e-spec.ts`

Include:

- `GET /` returns 200
- response contains GOV.UK layout markup
- response contains phase banner

## `test/react/react-ssr.service.spec.ts`

Include:

- `render(ExampleServerComponent, props)` returns HTML string
- output contains GOV.UK CSS classes

---

# 12. Rendering Mode Constraints

## Nunjucks SSR Pages

- Use GOV.UK Frontend Nunjucks macros wherever possible
- Must remain functional without client-side JavaScript, although client-side JavaScript can be used in a progressive enhancement capacity

## React SSR Pages

- Rendered exclusively via `ReactSSRService.render()`
- Use `renderToString` (or up-to-date equivalent) only
- No hydration

## React Islands

- Must render independently
- Must not create duplicate forms
- Must progressively enhance existing DOM

---

# 13. Documentation

Generate:

## `README.md`

Include:

- Prerequisites
- Quick start
- Explanation of:
  - NestJS BFF architecture
  - Nunjucks SSR
  - React SSR
  - React islands
  - JSON Server
  - esbuild pipeline

## `ARCHITECTURE.md`

Include:

- Mermaid architecture diagram
- Explanation of rendering modes

## `PRINCIPLES.md`

Include a checklist confirming:

- Progressive enhancement
- No SPA routing
- GOV.UK Frontend usage
- React SSR without hydration
- Independent island bundles
- Server-first rendering approach

---

# 14. End-to-End Validation

The generated scaffold must work immediately after:

```bash
npm install
npm run dev
```

A developer must then be able to:

1. Visit `http://localhost:3000`
2. Observe a working GOV.UK-styled page
3. Observe Nunjucks rendering
4. Observe React SSR HTML rendering
5. Observe a mounted React island
6. Observe static assets loading correctly
7. Observe JSON Server running on port 3001
8. Disable JavaScript and still use the site baseline successfully
