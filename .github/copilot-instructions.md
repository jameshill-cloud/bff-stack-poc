# HMCTS Small Claims Application Portal — BFF PoC Scaffold Specification

> **Instructions for Copilot agent**: Generate a minimal working scaffold for the full-stack web application described below. Follow every constraint and decision listed precisely. Where a choice is marked **[DECISION]**, implement exactly as stated — do not substitute alternatives. Where a section says **[SCAFFOLD]**, generate representative, working boilerplate — not placeholder comments or empty files. The result must be a runnable application: `npm install && npm run dev` must start the full stack with no manual configuration steps beyond copying `.env.example` to `.env`.

---

## 1. Project Overview

### Purpose

A proof-of-concept Backend-for-Frontend (BFF) web application for HMCTS digital services, demonstrating a modern, GDS-compliant technology stack. The scenario is a litigant-in-person submitting a small claims money claim online. This domain is deliberately chosen: users may be distressed, non-technical, accessing the service on older devices or poor connections, and the service must work reliably for all of them. Progressive enhancement is not merely a GDS compliance requirement here — it is a genuine and primary user need.

### Architectural Argument

The PoC makes a coherent case that server-first is the correct default for public-facing government services. NestJS provides routing, session management, and API orchestration. Nunjucks and GOV.UK Frontend deliver accessible, standards-compliant UI. Server-rendered React components demonstrate that React's component model has value independently of its client runtime. The fee calculator island demonstrates that targeted hydration — with a well-designed fallback — adds genuine user value without compromising the baseline experience.

### Goals

- Demonstrate full service functionality with JavaScript **completely disabled** in the browser
- Demonstrate React SSR (non-hydrated) for server-side composability with zero client bundle
- Demonstrate a React island with meaningful client-side enhancement and a clean, functionally-complete no-JS fallback
- Show GOV.UK Frontend components used correctly and idiomatically throughout
- Keep client-side JavaScript minimal, scoped, and purposeful — no SPA overhead, no client-side router
- Produce a scaffold a development team could confidently extend toward a production HMCTS service

### Non-Goals

- Production-ready authentication, authorisation, or security hardening
- Real HMCTS backend API integration (replaced entirely by JSON Server)
- Complete feature coverage — representative slices only; stubs are acceptable for non-demonstrated paths
- Payment processing (fee summary step shows payment method selection only)
- Support for multiple users (as a PoC, the project need not support more than one user, or any login or user authentication system, and adding them would complicate the code unnecessarily)

---

## 2. Domain Scenario

### Service: Submit a Small Claims Money Claim

The portal covers four distinct areas. Each one demonstrates a different capability of the stack. They are described in detail in Sections 7–10.

| Area                           | Primary technology                             | Section |
| ------------------------------ | ---------------------------------------------- | ------- |
| Multi-step application journey | NestJS + Nunjucks + GOV.UK Frontend            | §7      |
| Fee calculator                 | React island with server-rendered fallback     | §8      |
| My applications list           | NestJS + Nunjucks + GOV.UK Frontend (no React) | §9      |
| Application status dashboard   | React SSR (non-hydrated), zero client JS       | §10     |

---

## 3. Technology Stack

### Core

| Concern              | Technology                                         | Notes                                                                                                                        |
| -------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Runtime              | Node.js ≥ 20 LTS                                   |                                                                                                                              |
| Framework            | **NestJS** (latest stable)                         | `@nestjs/cli` scaffold base; Express adapter                                                                                 |
| Primary templating   | **Nunjucks**                                       | Configured directly via `nunjucks` npm package; all pages except React SSR (non-hydrated) components                         |
| CSS / UI components  | **GOV.UK Frontend v5.x** (`govuk-frontend`)        | Use GOV.UK Nunjucks macros and the precompiled GOV.UK Frontend CSS bundle; no custom Sass pipeline required for the scaffold |
| Mock API             | **JSON Server**                                    | Separate process on port 3001                                                                                                |
| React (SSR)          | **React 18** + `react-dom/server` `renderToString` | Server-only; zero client JS shipped for React SSR (non-hydrated) components                                                  |
| React (islands)      | **React 18** client bundle                         | Loaded only on pages that require it; mounted via island pattern                                                             |
| Client bundler       | **esbuild**                                        | One small bundle per island; no webpack                                                                                      |
| Language             | **TypeScript** strict mode throughout              | Shared `tsconfig.json`; separate `tsconfig.build.json`                                                                       |
| Validation           | **class-validator** + **class-transformer**        | DTOs for every form step                                                                                                     |
| Testing              | **Jest** + **Supertest**                           | Unit and integration; smoke tests for every route                                                                            |
| Linting / formatting | **ESLint** + **Prettier**                          | Configurations aligned to typical GOV.UK project standards                                                                   |

### [DECISION] React is invoked directly from NestJS — no Next.js, Remix, or other meta-framework

`ReactSSRService` calls `renderToString` directly. NestJS remains the single controlling framework. There is no framework-in-framework nesting.

### [DECISION] No client-side router of any kind

All navigation is standard `<a href>` links and `<form action>` submissions — full browser navigations. Do not include `react-router`, `wouter`, TanStack Router, or any equivalent.

### [DECISION] GOV.UK Frontend components are not re-implemented in React

React components (both SSR and island) apply GOV.UK Frontend CSS class names directly in JSX where needed. They do not wrap or replace GOV.UK Nunjucks macros — those are used in Nunjucks templates as intended.

---

## 4. Repository Structure

```
/
├── src/
│   ├── main.ts                               # NestJS bootstrap
│   ├── app.module.ts                         # Root module — wiring only
│   ├── config/
│   │   └── configuration.ts                  # Typed config: PORT, MOCK_API_BASE_URL, SESSION_SECRET
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts      # Global filter → renders views/error.njk
│   │   ├── guards/
│   │   │   └── journey-step.guard.ts         # Prevents skipping form steps; redirects back
│   │   │   ├── decorators/
│   │   │   └── required-steps.decorator.ts   # @RequiredSteps metadata decorator for JourneyStepGuard
│   │   ├── middleware/
│   │   │   └── session.middleware.ts         # express-session configuration
│   │   └── helpers/
│   │       └── validation-errors.helper.ts   # Maps class-validator errors → GOV.UK error format
│   ├── modules/
│   │   ├── apply/                            # Multi-step application journey
│   │   │   ├── apply.module.ts
│   │   │   ├── apply.controller.ts
│   │   │   ├── apply.service.ts              # Session accumulation, step sequencing, branching
│   │   │   └── dto/
│   │   │       ├── claim-type.dto.ts
│   │   │       ├── your-details.dto.ts
│   │   │       ├── defendant-details.dto.ts
│   │   │       ├── claim-details.dto.ts
│   │   │       ├── fee-summary.dto.ts
│   │   │       └── application-form-data.type.ts
│   │   ├── applications/                     # My applications list
│   │   │   ├── applications.module.ts
│   │   │   ├── applications.controller.ts
│   │   │   └── applications.service.ts       # Filter, sort, search, paginate
│   │   └── dashboard/                        # Application status dashboard (React SSR (non-hydrated))
│   │       ├── dashboard.module.ts
│   │       ├── dashboard.controller.ts
│   │       └── dashboard.service.ts
│   ├── api-client/
│   │   ├── api-client.module.ts              # HttpModule wrapper
│   │   ├── api-client.service.ts             # Typed methods for all mock API calls
│   │   └── types/
│   │       └── api.types.ts                  # Shared API response types
│   └── react/
│       ├── react.module.ts
│       ├── ssr/
│       │   ├── react-ssr.service.ts          # renderToString wrapper
│       │   └── components/
│       │       ├── dashboard/
│       │       │   ├── ApplicationDetailPage.tsx   # [React SSR (non-hydrated)] Single application detail (a.k.a. the "dashboard" itself)
│       │       │   ├── ApplicationSummaryCard.tsx  # [React SSR (non-hydrated)] Summary of application details (used in detail page)
│       │       │   └── StatusTimeline.tsx          # [React SSR (non-hydrated)] Ordered status event list (used in detail page)
│       │       └── index.ts
│       └── islands/
│           ├── island-loader.ts              # Server: generates mount point HTML + serialises props
│           └── FeeCalculator/
│               ├── FeeCalculator.tsx         # [ISLAND] Client-side fee calculator component
│               └── index.ts
├── views/
│   ├── layouts/
│   │   └── base.njk                         # GOV.UK layout shell; island script injection point
│   ├── partials/
│   │   ├── header.njk
│   │   ├── footer.njk
│   │   ├── phase-banner.njk
│   │   ├── back-link.njk
│   │   └── error-summary.njk
│   ├── error.njk
│   ├── apply/
│   │   ├── start.njk
│   │   ├── claim-type.njk
│   │   ├── your-details.njk
│   │   ├── defendant-details.njk
│   │   ├── claim-details.njk
│   │   ├── fee-summary.njk                  # Contains fee calculator island mount + fallback
│   │   ├── check-your-answers.njk           # Conventional "check your answers" pattern using GOV.UK nunjucks components
│   │   └── confirmation.njk
│   ├── applications/
│   │   └── list.njk                         # Filterable, sortable, searchable applications table
│   └── dashboard/
│       └── index.njk                        # Nunjucks shell; injects React SSR (non-hydrated) dashboard HTML
├── client/
│   ├── entry.ts                             # GOV.UK Frontend JS init + island bootstrapper
│   └── islands/
│       └── FeeCalculator/
│           └── mount.tsx                    # ReactDOM.createRoot mount point for fee calculator
├── public/
│   ├── assets/                              # Copied from govuk-frontend dist
│   └── js/
│       └── (esbuild output — island bundles)
├── mock-api/
│   ├── db.json                              # JSON Server seed data
│   └── routes.json                          # JSON Server route aliases
├── scripts/
│   ├── build-islands.ts                     # esbuild compilation script
│   └── copy-assets.ts                       # Copies GOV.UK Frontend assets → public/assets
├── test/
│   ├── app.e2e-spec.ts
│   ├── apply/
│   │   └── apply.controller.spec.ts
│   ├── applications/
│   │   └── applications.controller.spec.ts
│   ├── dashboard/
│   │   └── dashboard.controller.spec.ts
│   └── react/
│       └── react-ssr.service.spec.ts
├── types/
│   └── express.d.ts                         # Augments Express Request with session type
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## 5. NestJS Application Setup

### Bootstrap (`main.ts`)

- Use Express adapter (default — do not use Fastify)
- Configure Nunjucks as view engine via `nunjucks.configure`, pointing to the `views/` directory; add `node_modules/govuk-frontend/dist` to the search paths so GOV.UK macros resolve
- Serve `public/` as static assets under `/`
- The scaffold uses the precompiled GOV.UK Frontend CSS bundle from `govuk-frontend/dist`
- `scripts/copy-assets.ts` copies the following into `public/assets/`:
  - `govuk-frontend.min.css`
  - `/fonts`
  - `/images`
- No Sass compilation pipeline is required for the scaffold
- Register `express-session` middleware with in-memory store (PoC only — document this is not production-safe)
- Register global `ValidationPipe` with `whitelist: true` and `transform: true`
- Register global `HttpExceptionFilter`
- Start on `PORT` from config (default `3000`)

### Session middleware (`session.middleware.ts`)

```typescript
import session from "express-session";

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET ?? "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // set true behind HTTPS in production
});
```

### Session type (`types/express.d.ts`)

```typescript
import { ApplicationFormData } from "../src/modules/apply/dto/application-form-data.type";

declare module "express-session" {
  interface SessionData {
    applicationData?: Partial<ApplicationFormData>;
    completedSteps?: string[];

    validationErrors?: {
      step: string;
      errors: Record<string, unknown>;
    };

    confirmation?: {
      referenceNumber: string;
      submittedAt: string;
    };
  }
}
```

### Environment Variables (`.env.example`)

```
PORT=3000
MOCK_API_BASE_URL=http://localhost:3001
SESSION_SECRET=dev-secret-change-me
NODE_ENV=development
```

---

## 6. Nunjucks Configuration

- Search paths: `views/` and `node_modules/govuk-frontend/dist` (enables `{% from "govuk/components/button/macro.njk" import govukButton %}`)
- `autoescape: true` globally; use `| safe` only for trusted server-generated HTML (React SSR output, island mount points)
- Add a custom Nunjucks global function `govukErrors(errors, fieldName)` that extracts the GOV.UK-format error object (see `https://design-system.service.gov.uk/components/error-message/` and `https://design-system.service.gov.uk/components/error-summary/` for reference) for a specific field from the class-validator error array
- All templates extend `views/layouts/base.njk`
- Base layout should render a phase banner indicating the PoC status of the application (alpha), to avoid the possibility of visitors misinterpeting the app as a live service intended for real-world use

### `base.njk` responsibilities

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

Note that `/assets/govuk-frontend.min.css`, `/assets/fonts`, and `/assets/images` are copied directly from `govuk-frontend/dist` by `scripts/copy-assets.ts`. The scaffold does not compile GOV.UK Frontend SCSS.

The `<script>document.body.classList.add('js-enabled');</script>` snippet is the JS detection pattern used throughout this scaffold (note: GOV.UK Frontend v5 uses `govuk-frontend-supported` internally, but this scaffold uses the simpler `js-enabled` class for its own island progressive-enhancement CSS). Island CSS uses `.js-enabled .js-only { display: block }` and `.no-js-only { display: none }` when JS is available.

---

## 7. Multi-Step Application Journey

### Routes

| Method     | Route                       | Description                                                      |
| ---------- | --------------------------- | ---------------------------------------------------------------- |
| `GET`      | `/apply/start`              | Eligibility check and service guidance                           |
| `GET/POST` | `/apply/claim-type`         | Step 1 — Money claim or other (branch point)                     |
| `GET/POST` | `/apply/your-details`       | Step 2 — Claimant name, address, contact                         |
| `GET/POST` | `/apply/defendant-details`  | Step 3 — Defendant name and address                              |
| `GET/POST` | `/apply/claim-details`      | Step 4 — Description, amount, incident date                      |
| `GET/POST` | `/apply/fee-summary`        | Step 5 — Fee display + payment method (island)                   |
| `GET/POST` | `/apply/check-your-answers` | Step 6 — Full review (uses GOV.UK summary/summarylist component) |
| `GET`      | `/apply/confirmation`       | Confirmation — reference number, next steps                      |

### Step Guard (`journey-step.guard.ts`)

**[SCAFFOLD]** Implement a NestJS guard that:

- Reads `session.completedSteps` (an array of completed step names)
- Each route handler is decorated with `@RequiredSteps(['claim-type', 'your-details', ...])` (a custom decorator)
- If the required preceding steps are not in `completedSteps`, redirect to the earliest incomplete step
- This prevents users navigating directly to `/apply/check-your-answers` without completing earlier steps

The `@RequiredSteps` decorator is a custom NestJS metadata decorator defined at `src/common/decorators/required-steps.decorator.ts`:

```typescript
import { SetMetadata } from "@nestjs/common";
export const REQUIRED_STEPS_KEY = "requiredSteps";
export const RequiredSteps = (...steps: string[]) =>
  SetMetadata(REQUIRED_STEPS_KEY, steps);
```

The `JourneyStepGuard` injects NestJS `Reflector` to read this metadata:

```typescript
constructor(private reflector: Reflector) {}
```

and reads it in `canActivate` as:

```typescript
const required =
  this.reflector.get<string[]>(REQUIRED_STEPS_KEY, context.getHandler()) ?? [];
```

Add `src/common/decorators/required-steps.decorator.ts` to the repository structure.

For all downstream money-claim journey routes (`/apply/your-details` onward), the guard must also verify that:

```typescript
session.applicationData?.claimType === "money-claim";
```

If the claim type is missing or any non-supported value, redirect to `/apply/claim-type/not-supported`.

### Form Handling Pattern (all steps)

- `GET` handler: render the step template, pre-populating fields from `session.applicationData`
- `POST` handler: validate the submitted body against the step's DTO; on failure, store errors in session and redirect back to `GET` (PRG); on success, merge data into `session.applicationData`, add step name to `session.completedSteps`, redirect to next step
- Use `class-validator` DTOs with `@IsNotEmpty`, `@IsEmail`, `@IsNumberString`, `@IsDateString` etc. as appropriate
- On redirect-back-with-errors, the `GET` handler reads errors from session, clears them, and passes them to the template

### Validation Error Session Pattern

Validation errors follow explicit PRG semantics:

1. POST handler validates request DTO
2. On validation failure:
   - map validation errors into GOV.UK-compatible format
   - store under `session.validationErrors`
   - redirect back to the GET route
3. GET handler:
   - reads `session.validationErrors`
   - passes matching step errors to the template
   - immediately clears `session.validationErrors`

Example session structure:

```typescript
session.validationErrors = {
  step: "your-details",
  errors: mappedErrors,
};
```

Validation errors must never persist beyond a single GET render cycle.

### Branching Logic

The `/apply/claim-type` step sets `session.applicationData.claimType`. If the user selects anything other than `money-claim`, the controller redirects to a stub page (`/apply/claim-type/not-supported`) explaining the service currently supports money claims only and signposting other routes. No subsequent steps are accessible from that branch in the PoC.

### Check Your Answers page

The `/apply/check-your-answers` GET handler follows the standard GOV.UK "Check Your Answers" pattern and uses GDS nunjucks components.

```nunjucks
{# views/apply/check-your-answers.njk #}
{% extends "layouts/base.njk" %}
{% block content %}
  <h1 class="govuk-heading-xl">Check your answers</h1>
  ...
  <form method="POST" action="/apply/check-your-answers">
    {{ govukButton({ text: "Accept and submit" }) }}
  </form>
{% endblock %}
```

`ApplyService.buildCheckYourAnswersSections(sessionData)` assembles the `CheckYourAnswersSection[]` from session, mapping each completed step's data into labelled rows with change links pointing back to the relevant step. CSRF protection is intentionally omitted from the scaffold.

---

## 8. Fee Calculator — React Island

### Concept

The `/apply/fee-summary` step demonstrates the island pattern. Court fees for small claims are banded by claim value. The fee is always calculated server-side. When JavaScript is available, the user can adjust the claim amount inline and see the fee update immediately — but the server validates the final submitted values independently.

The fee summary page follows a progressive enhancement model:

- The page always renders a complete, fully functional HTML form server-side
- The React island enhances part of the UI when JavaScript is available
- The form itself remains server-rendered and is never replaced by React
- The page must remain fully usable if the island fails to load or JavaScript is disabled entirely

### No-JS Baseline (always rendered)

The NestJS controller:

1. Reads `session.applicationData.amountClaimed`
2. Calls `ApiClientService.calculateFee(amountClaimed)` → `{ band: string; amount: number }`
3. Passes `fee`, `amountClaimed`, and `paymentMethods` to the template

`fee-summary.njk` renders:

- A single canonical `<form method="POST">`
- A server-rendered `govukSummaryList` showing:
  - claim value
  - fee band
  - fee amount
- `govukRadios` for payment method selection (BACS / cheque / card)
- A `govukButton` to continue
- Hidden inputs for:
  - `amountClaimed`
  - `feeBand`
  - `feeAmount`

This baseline is fully functional with no JavaScript.

### Enhanced Behaviour (JS island)

When JavaScript is available, the React island enhances only the fee summary portion of the page. The server-rendered form, payment radios, and submit button remain in place and continue to function normally.

The island provides:

- An editable `govukInput`-styled amount field (This inline amount editing capability is an enhancement available only when JavaScript is enabled. Without JavaScript, users can still change the amount claimed by navigating back to the `/apply/claim-details` step via the standard "Change" link on the Check Your Answers page or browser navigation.)
- Client-side recalculation of the fee band using bundled fee banding logic
- A live fee summary that updates immediately as the amount changes
- A live payment breakdown that updates as the user selects a payment method radio
- A contextual `govukInsetText` shown when the claim value is below £1,000, linking to GOV.UK fee remission guidance

The island updates the existing hidden form fields (`amountClaimed`, `feeBand`, `feeAmount`) so that the canonical server-rendered form submits the latest values.

The server independently recalculates and validates the fee during form submission. Client-side values are treated as advisory only and cannot bypass server-side logic.

### Progressive Enhancement Structure

The React island enhances a dedicated subsection of the page. It does not replace or duplicate the form.

Structure of `fee-summary.njk`:

```nunjucks
<form method="POST" action="/apply/fee-summary">

  {# Always-rendered no-JS summary #}
  <div id="fee-summary-fallback">
    {# govukSummaryList rendered server-side #}
  </div>

  {# React enhancement mount point #}
  {{ feeCalculatorIsland | safe }}

  {# Canonical submitted values #}
  <input type="hidden" name="amountClaimed" value="{{ amountClaimed }}">
  <input type="hidden" name="feeBand" value="{{ fee.band }}">
  <input type="hidden" name="feeAmount" value="{{ fee.amount }}">

  {# Payment method radios remain server-rendered #}
  {{ govukRadios({
    name: "paymentMethod",
    items: paymentMethodItems
  }) }}

  {{ govukButton({
    text: "Continue"
  }) }}

</form>
```

Note that `{{ feeCalculatorIsland | safe }}` renders a `<div id="fee-calculator-root" ...>` (produced by `renderIslandMount`). This div is the React mount target and is distinct from `<div id="fee-summary-fallback">`. Both elements must be present in the rendered HTML simultaneously:

- `#fee-summary-fallback` — the static server-rendered fee summary; hidden by the island on mount.
- `#fee-calculator-root` — the React island mount point; populated by the island on mount.

The controller must set `feeCalculatorIsland` in the template context using:

```typescript
const feeCalculatorIsland = renderIslandMount({
  mountId: "fee-calculator-root",
  bundle: "/js/FeeCalculator/mount.js",
  props: islandProps,
});
```

The controller must generate the island mount HTML exclusively via `renderIslandMount()` from `src/react/islands/island-loader.ts`. Templates must not manually construct `data-props` JSON attributes or inline island mount markup.

When the island mounts successfully:

- it enhances/replaces the visual fee summary UI only
- it hides the static summary section (#fee-summary-fallback)
- it does not remove or recreate the form
- it does not render its own submit button or duplicate payment radios

If the island fails to load for any reason, the server-rendered fallback remains fully usable.

Island Implementation

[SCAFFOLD] Implement FeeCalculator.tsx end-to-end:

```
// src/react/islands/FeeCalculator/FeeCalculator.tsx
interface FeeCalculatorProps {
  initialAmount: number;
  initialFee: { band: string; amount: number };
  paymentMethods: Array<{ value: string; label: string }>;
}
```

The island:

- reads and updates the hidden form fields already present in the DOM
- renders enhanced fee summary UI inside #fee-calculator-root
- never creates a second <form>
- never duplicates payment method radios or submit controls

Fee banding logic (replicate in the island bundle — it is stable and safe to ship client-side):

| Claim value         | Band | Fee  |
| ------------------- | ---- | ---- |
| Up to £300          | A    | £35  |
| £300.01 – £500      | B    | £50  |
| £500.01 – £1,000    | C    | £70  |
| £1,000.01 – £1,500  | D    | £80  |
| £1,500.01 – £3,000  | E    | £115 |
| £3,000.01 – £5,000  | F    | £205 |
| £5,000.01 – £10,000 | G    | £455 |

Island Mount Behaviour

On successful mount, `FeeCalculator` may hide the static summary section: `document.getElementById('fee-summary-fallback')?.setAttribute('hidden', 'true');` This hides only the static summary display. The form itself remains intact and continues to function normally.

**Bundle**: esbuild compiles `client/islands/FeeCalculator/mount.tsx` → `public/js/FeeCalculator/mount.js` (target `es2020`, format `esm`, minify in production).

---

## 9. My Applications List

### Concept

**[DECISION]** This page uses **no React** — neither SSR nor island. It is implemented entirely with NestJS controller logic and Nunjucks templates. This is deliberate: it demonstrates that GOV.UK Frontend components combined with server-side query-string-driven state are entirely sufficient for a realistic, data-dense, interactive page. It is a counterpoint to the assumption that tables with filtering, sorting, search and pagination require a client-side library.

### Routes

| Method | Route              | Description                                                  |
| ------ | ------------------ | ------------------------------------------------------------ |
| `GET`  | `/my-applications` | Filterable, sortable, searchable, paginated application list |

### Query String Parameters

All UI state is expressed in the URL. No client-side state management of any kind.

```
/my-applications?search=smith&status=active&sort=submittedAt&order=desc&page=2
```

| Parameter | Default       | Description                                                                            |
| --------- | ------------- | -------------------------------------------------------------------------------------- |
| `search`  | `''`          | Free-text search — matched against reference number, defendant name, claim description |
| `status`  | `''` (all)    | Filter by status: `submitted` / `awaiting-response` / `hearing-scheduled` / `closed`   |
| `sort`    | `submittedAt` | Sort column: `submittedAt` / `reference` / `amount` / `status`                         |
| `order`   | `desc`        | Sort direction: `asc` / `desc`                                                         |
| `page`    | `1`           | Pagination                                                                             |

### Controller Logic (`ApplicationsController`)

**[SCAFFOLD]** Implement:

1. Parse and validate query parameters (invalid values silently reset to defaults)
2. Call `ApplicationsService.findAll(filters)`, which calls `ApiClientService.getApplications()` and applies search, filter, sort in-memory (appropriate for mock data volumes)
3. Apply pagination (page size: 10)
4. Pass to template: `{ applications, total, page, pageSize, totalPages, search, status, sort, order }`
5. The template reconstructs sort links by appending `?sort=<col>&order=<dir>` to the current query string while preserving the active `search`, `status`, and `page` parameters

### Template (`applications/list.njk`)

**[SCAFFOLD]** Implement with:

**Search and filter form** (`method="GET" action="/my-applications"`):

- `govukInput` with `name="search"` for free-text search, pre-populated with `{{ search }}`
- `govukSelect` with `name="status"` for status filter, pre-populated with `{{ status }}`; options: All / Submitted / Awaiting Response / Hearing Scheduled / Closed
- A hidden `<input name="sort" value="{{ sort }}">` and `<input name="order" value="{{ order }}">` to preserve sort state across filter submissions
- `govukButton` with text "Search"
- A "Clear filters" `govukLink` pointing to `/my-applications`

**Results summary:**

- Paragraph: `"Showing {{ applications | length }} of {{ total }} applications"`
- If `applications` is empty: `govukInsetText` with text "No applications match your search."

**Application table:**

A govukTable component (if possible; otherwise a custom table that replicates as much of the govukTable as possibles) with columns: Reference Number, Claim Type, Amount Claimed, Date Submitted, Status.

Column headers that support sorting are `<a>` links. Each sort link preserves active search and filter query params and toggles `order` direction if the column is already the active sort column. The active sort column header includes a directional arrow (`↑` / `↓`) and a `<span class="govuk-visually-hidden">`, sorted ascending/descending`</span>` for screen reader context.

The active sort column `<th>` must include `aria-sort="ascending"` or `aria-sort="descending"` as appropriate.

Status values are rendered as `<strong class="govuk-tag govuk-tag--{colour}">` where colours map as follows:

| Status            | GOV.UK tag colour            |
| ----------------- | ---------------------------- |
| Submitted         | Blue (`govuk-tag--blue`)     |
| Awaiting Response | Yellow (`govuk-tag--yellow`) |
| Hearing Scheduled | Purple (`govuk-tag--purple`) |
| Closed            | Grey (`govuk-tag--grey`)     |

Reference Number cells contain a `govukLink` navigating to `/dashboard/{{ application.referenceNumber }}`.

**Pagination:** `govukPagination` macro, server-rendered, using `?page=N` query string parameter, preserving all other active query parameters.

---

## 10. Application Status Dashboard — React SSR

### Concept

After submission (and also by clicking a Reference Number anchor in an item within the My Applications list), the user can view their application status on a dashboard page. This page is rendered entirely as a server-rendered React component tree, invoked by a NestJS controller. **No React JavaScript is shipped to the client for this page.** The browser receives plain HTML.

### Routes

| Method | Route                         | Description                                                     |
| ------ | ----------------------------- | --------------------------------------------------------------- |
| `GET`  | `/dashboard/:referenceNumber` | Detail view for a single application (React SSR (non-hydrated)) |

### Classic React SSR (non-hydrated) Rendering Pattern

The NestJS controller:

1. Fetches required data from `ApiClientService`
2. Passes data as props to `ReactSSRService.render(Component, props)`
3. Passes the resulting HTML string to a thin Nunjucks layout shell (`dashboard/index.njk`) as `dashboardHtml`
4. The shell renders the GOV.UK header, footer, phase banner, and back link, then injects `{{ dashboardHtml | safe }}`

**[DECISION]** Data fetching happens in the NestJS service layer, not inside React SSR components. The React SSR components are pure rendering functions — they receive all data as props. This keeps the NestJS service as the single point of API orchestration and makes the React SSR components straightforwardly testable.

### React SSR (non-hydrated) Component Tree

**[SCAFFOLD]** Implement all components listed below:

#### `ApplicationDetailPage.tsx`

Props: `{ application: Application; timeline: TimelineEvent[] }`

Composes: `<ApplicationSummaryCard>` + `<StatusTimeline>` + `<NextStepsPanel>`

#### `ApplicationSummaryCard.tsx`

Props: `{ application: Application }`

Renders a GOV.UK summary card (`govuk-summary-card`) showing:

- Reference number (as an `<h2>` within the card title, linking to `/dashboard/:referenceNumber`)
- Status tag (same colour mapping as the applications list)
- Claim value
- Date submitted
- Defendant name

Used at the top of `ApplicationDetailPage`.

#### `StatusTimeline.tsx`

Props: `{ events: TimelineEvent[] }`

Renders an ordered list of status events (`TimelineEvent: { date: string; status: string; description: string }`) as a styled timeline using a `<ol class="govuk-list">` with date and description for each event, newest first.

### `ReactSSRService`

```typescript
// src/react/ssr/react-ssr.service.ts
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

React SSR output is treated as trusted server-generated HTML because React escapes interpolated content by default during `renderToString()`. Controllers and services must never concatenate raw user-provided HTML into the rendered output before passing it to Nunjucks via `| safe`.

---

## 11. Island Loader Pattern

### `island-loader.ts`

```typescript
// src/react/islands/island-loader.ts

export interface IslandManifest {
  mountId: string; // id of the DOM element to mount into
  bundle: string; // absolute public path e.g. /js/fee-calculator.js
  props: unknown; // serialised into data-props as JSON
}

export function renderIslandMount(manifest: IslandManifest): string {
  const safeProps = JSON.stringify(manifest.props)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return `<div id="${manifest.mountId}" data-island="${manifest.bundle}" data-props='${safeProps}'></div>`;
}
```

### Island Bootstrapper (`client/entry.ts`)

```typescript
// client/entry.ts
import { initAll } from "govuk-frontend";

// Initialise GOV.UK Frontend components
initAll();

// Mount all islands on the page
document.querySelectorAll<HTMLElement>("[data-island]").forEach(async (el) => {
  const bundle = el.dataset.island;
  const props = JSON.parse(el.dataset.props ?? "{}");
  if (!bundle) return;
  // Construct a full URL so dynamic import resolves correctly across all browsers
  const bundleUrl = new URL(bundle, window.location.origin).href;
  const mod = await import(/* @vite-ignore */ bundleUrl);
  mod.default(el, props);
});
```

Note that `govuk-frontend` JavaScript is bundled into `/js/entry.js` via the npm package import. The scaffold does not load `govuk-frontend.min.js` separately as a static asset. `client/entry.ts` is bundled separately from island bundles and emitted as `/js/entry.js`.

The fee calculator island bundle must remain isolated from the global entry bundle:

- no shared runtime chunk
- no code splitting
- no React imported into `entry.ts`

`entry.ts` is responsible only for:

- GOV.UK Frontend initialisation
- generic island discovery and mounting

### Island Mount Convention (`client/islands/FeeCalculator/mount.tsx`)

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { FeeCalculator } from '../../../src/react/islands/FeeCalculator/FeeCalculator';

export default function mount(el: HTMLElement, props: unknown) {
  createRoot(el).render(<FeeCalculator {...(props as any)} />);
}
```

---

## 12. Mock API (JSON Server)

### Setup

Install `json-server` as a dev dependency. Start with:

```
json-server --watch mock-api/db.json --port 3001 --routes mock-api/routes.json
```

### API Surface

| Method | Endpoint                                      | Description                                                                     |
| ------ | --------------------------------------------- | ------------------------------------------------------------------------------- |
| `GET`  | `/fees`                                       | Returns all fee bands; fee lookup logic is implemented in the NestJS BFF layer  |
| `GET`  | `/applications`                               | All applications (supports `?status=`, `?search=` query params via json-server) |
| `GET`  | `/applications?referenceNumber=SC-2024-00123` | Lookup application by reference number                                          |
| `POST` | `/applications`                               | Create application — returns `{ referenceNumber, submittedAt }`                 |

### `mock-api/routes.json`

```json
{
  "/fees": "/fees"
}
```

### `mock-api/db.json` — **[SCAFFOLD]** Seed with realistic data:

```json
{
  "fees": [
    { "id": 1, "band": "A", "minValue": 0, "maxValue": 300, "amount": 35 },
    { "id": 2, "band": "B", "minValue": 300.01, "maxValue": 500, "amount": 50 },
    {
      "id": 3,
      "band": "C",
      "minValue": 500.01,
      "maxValue": 1000,
      "amount": 70
    },
    {
      "id": 4,
      "band": "D",
      "minValue": 1000.01,
      "maxValue": 1500,
      "amount": 80
    },
    {
      "id": 5,
      "band": "E",
      "minValue": 1500.01,
      "maxValue": 3000,
      "amount": 115
    },
    {
      "id": 6,
      "band": "F",
      "minValue": 3000.01,
      "maxValue": 5000,
      "amount": 205
    },
    {
      "id": 7,
      "band": "G",
      "minValue": 5000.01,
      "maxValue": 10000,
      "amount": 455
    }
  ],
  "applications": [
    {
      "id": 1,
      "referenceNumber": "SC-2024-00123",
      "claimType": "money-claim",
      "claimantName": "Jane Smith",
      "defendantName": "ABC Repairs Ltd",
      "amountClaimed": 850,
      "feeBand": "C",
      "feeAmount": 70,
      "description": "Faulty boiler repair — work not completed to standard",
      "incidentDate": "2024-03-15",
      "status": "awaiting-response",
      "submittedAt": "2024-04-02T09:15:00Z",
      "timeline": [
        {
          "date": "2024-04-02",
          "status": "submitted",
          "description": "Claim submitted online."
        },
        {
          "date": "2024-04-10",
          "status": "awaiting-response",
          "description": "Claim served on defendant. Response due by 2024-05-10."
        }
      ]
    },
    {
      "id": 2,
      "referenceNumber": "SC-2024-00089",
      "claimType": "money-claim",
      "claimantName": "Jane Smith",
      "defendantName": "FastCar Rentals",
      "amountClaimed": 320,
      "feeBand": "B",
      "feeAmount": 50,
      "description": "Unlawful deduction from hire deposit",
      "incidentDate": "2024-01-20",
      "status": "hearing-scheduled",
      "submittedAt": "2024-02-01T14:30:00Z",
      "timeline": [
        {
          "date": "2024-02-01",
          "status": "submitted",
          "description": "Claim submitted online."
        },
        {
          "date": "2024-02-14",
          "status": "awaiting-response",
          "description": "Claim served on defendant."
        },
        {
          "date": "2024-03-01",
          "status": "hearing-scheduled",
          "description": "Hearing scheduled for 2024-05-20 at Manchester County Court."
        }
      ]
    },
    {
      "id": 3,
      "referenceNumber": "SC-2023-00412",
      "claimType": "money-claim",
      "claimantName": "Jane Smith",
      "defendantName": "TechFix Solutions",
      "amountClaimed": 199,
      "feeBand": "A",
      "feeAmount": 35,
      "description": "Laptop repair — device returned in worse condition",
      "incidentDate": "2023-10-05",
      "status": "closed",
      "submittedAt": "2023-11-03T11:00:00Z",
      "timeline": [
        {
          "date": "2023-11-03",
          "status": "submitted",
          "description": "Claim submitted online."
        },
        {
          "date": "2023-11-20",
          "status": "awaiting-response",
          "description": "Claim served on defendant."
        },
        {
          "date": "2023-12-15",
          "status": "closed",
          "description": "Claim settled by agreement. No hearing required."
        }
      ]
    }
  ]
}
```

### `ApiClientService` typed methods

**[SCAFFOLD]** Implement all of the following in `api-client.service.ts`:

```typescript
getApplications(): Promise<Application[]>
getApplicationByRef(ref: string): Promise<Application>
getFeeBands(): Promise<FeeBand[]>
calculateFee(claimValue: number): Promise<{ band: string; amount: number }>
createApplication(data: CreateApplicationDto): Promise<{ referenceNumber: string; submittedAt: string }>
```

Note that `getApplicationByRef(ref)` must call `GET /applications?referenceNumber=<ref>` against JSON Server and:

- return the first matching record
- throw `NotFoundException` if no record exists

This indirection is intentional because JSON Server only supports direct `/resource/:id` lookups against the `id` field, whereas the PoC routes applications by human-readable reference number.

Note: the `?referenceNumber=<ref>` query parameter works because JSON Server supports field-equality filtering on any field in `db.json` using query parameters. This is only used for direct reference number lookups. The free-text search on the My Applications list page (`?search=`) is implemented entirely in-memory within `ApplicationsService.findAll()` and must NOT delegate search logic to JSON Server.

Also note that `calculateFee(claimValue)` must:

1. Fetch all fee bands from `/fees`
2. Resolve the matching band in the NestJS BFF layer using:
   - `claimValue >= minValue`
   - `claimValue <= maxValue`
3. Return the matching `{ band, amount }`.

The fee lookup algorithm is intentionally implemented in the BFF rather than JSON Server because JSON Server cannot perform numeric range queries against static data.

On any non-2xx HTTP response, throw `new ApiClientException(status, url)`. The global exception filter catches this and renders `views/error.njk` with an appropriate message.

---

## 13. Scripts and Build

### `scripts/copy-assets.ts`

**[SCAFFOLD]** Implement a script that copies the required GOV.UK Frontend static assets from `node_modules/govuk-frontend/dist/` into `public/assets/`.

Required copied assets:

- `govuk-frontend.min.css`
- `fonts/`
- `images/`

Resulting structure:

public/
└── assets/
├── govuk-frontend.min.css
├── fonts/
└── images/

Note that `govuk-frontend.min.js` is intentionally NOT copied here. GOV.UK Frontend JavaScript is imported via the npm package in `client/entry.ts` and bundled into `/js/entry.js` by esbuild. It must not be loaded as a separate static asset.

The scaffold intentionally avoids a custom Sass pipeline to keep the PoC deterministic and lightweight.

### `package.json` scripts

```json
{
  "scripts": {
    "build": "npm run copy-assets && nest build && ts-node scripts/build-islands.ts",
    "build:islands": "ts-node scripts/build-islands.ts",
    "build:islands:watch": "ts-node scripts/build-islands.ts --watch",
    "copy-assets": "ts-node scripts/copy-assets.ts",
    "start": "node dist/main",
    "dev": "concurrently \"npm run copy-assets\" \"npm run build:islands:watch\" \"nest start --watch\" \"npm run mock-api\"",
    "mock-api": "json-server --watch mock-api/db.json --port 3001 --routes mock-api/routes.json",
    "test": "jest",
    "test:e2e": "jest --config jest-e2e.json",
    "lint": "eslint \"{src,client}/**/*.{ts,tsx}\"",
    "format": "prettier --write \"{src,client,views}/**/*.{ts,tsx,njk}\""
  }
}
```

Note: `copy-assets` runs once at startup and then exits — this is intentional. GOV.UK Frontend static assets (CSS, fonts, images) come from a pinned npm package version and do not change during a dev session. Only island bundles require watch-mode recompilation.

### esbuild island build script (`scripts/build-islands.ts`)

**[SCAFFOLD]** Implement:

```typescript
import * as esbuild from "esbuild";
import { glob } from "glob";

const watch = process.argv.includes("--watch");
const production = process.env.NODE_ENV === "production";

const entryPoints = await glob("client/islands/**/mount.tsx");

const ctx = await esbuild.context({
  entryPoints,
  bundle: true,
  outdir: "public/js",
  entryNames: "[dir]/[name]", // produces e.g. public/js/FeeCalculator/mount.js
  outbase: "client/islands",
  format: "esm",
  target: "es2020",
  minify: production,
  sourcemap: !production,
});

if (watch) {
  await ctx.watch();
  console.log("Watching island bundles...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log("Island bundles built.");
}
```

**[DECISION]** Output path for fee calculator island bundle: `/js/FeeCalculator/mount.js`.

The `/apply/fee-summary` controller must construct the island mount using:

````typescript
export function renderIslandMount(manifest: IslandManifest): string {
  const safeProps = JSON.stringify(manifest.props)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027');

  return `<div id="${manifest.mountId}" data-island="${manifest.bundle}" data-props='${safeProps}'></div>`;
}```

---

## 14. Testing Requirements

**[SCAFFOLD]** Generate the following test files with meaningful, passing test cases. Tests must not be empty or `it.todo` stubs.

| File | Test cases |
|---|---|
| `test/app.e2e-spec.ts` | `GET /apply/start` returns 200 and contains "Start a money claim"; `GET /` redirects to `/apply/start` |
| `test/apply/apply.controller.spec.ts` | `POST /apply/claim-type` with no selection re-renders with 4xx error; valid `money-claim` selection redirects to `/apply/your-details`; `GET /apply/check-your-answers` without completed steps redirects to `/apply/start`; POST /apply/check-your-answers: validates required session data exists, calls ApiClientService.createApplication(...), stores returned reference number in session, clears application journey session state, redirects to /apply/confirmation (PRG) |
| `test/applications/applications.controller.spec.ts` | `GET /my-applications` returns 200 with table; `?status=submitted` filters results to submitted only; `?search=ABC` filters by defendant name; `?sort=amount&order=asc` returns results sorted by amount ascending |
| `test/dashboard/dashboard.controller.spec.ts` | `GET /dashboard/SC-2024-00123` returns 200 with React SSR components |
| `test/react/react-ssr.service.spec.ts` | `render(ApplicationSummaryCard, props)` returns string containing `govuk-summary-card`; `render(StatusTimeline, props)` returns string containing each event description |

---

## 15. Rendering Mode Constraints

### Nunjucks SSR Pages

- Use GOV.UK Frontend Nunjucks macros wherever possible
- Must not import or render React components
- Must remain fully functional without client-side JavaScript
- All navigation and form submission use standard browser requests

### React SSR (non-hydrated) Pages

- Rendered exclusively via `ReactSSRService.render()`
- Use `renderToString` only — no React Server Components (RSC)
- No React client runtime or hydration shipped to the browser
- React components are pure rendering functions with props-only inputs
- Data fetching occurs exclusively in NestJS services/controllers

### React Island Pages

- Must render a complete server-side fallback before any client JS executes
- Islands enhance existing DOM rather than replacing full pages
- Islands must not create duplicate `<form>` elements
- Islands must not own canonical application state
- Canonical submitted values remain server-controlled and server-validated

---

## 16. Constraints and Principles Checklist

Generate a `PRINCIPLES.md` file in the repo root containing this checklist, with each item marked as met by the scaffold.

### Progressive Enhancement

- [ ] All pages render correctly and are usable with `<script>` tags entirely absent from the HTML
- [ ] All form journeys complete successfully without any JavaScript in the browser
- [ ] The fee calculator fallback (static server-calculated fee + payment method radios) is fully functional without JavaScript
- [ ] No `onClick` handlers on non-interactive elements (`<div>`, `<span>`) used as a substitute for `<a>` or `<button>`

### GDS / GOV.UK Standards

- [ ] All pages use GOV.UK Frontend Nunjucks macros for standard components — no hand-rolled component equivalents
- [ ] GOV.UK error summary pattern (`govukErrorSummary`) used for all form validation errors, with links that focus the relevant field
- [ ] Post-Redirect-Get pattern used for all `POST` form handlers
- [ ] Page `<title>` follows the pattern: `{Page title} – Small Claims Portal – GOV.UK`
- [ ] Phase banner with `ALPHA` tag present on every page
- [ ] Back link present on every step of the multi-step form journey
- [ ] No client-side routing — every navigation is a full browser navigation
- [ ] Filter/search form on the applications list uses `method="GET"` so the URL reflects UI state

### Performance and Bundle Hygiene

- [ ] No React JavaScript is shipped to the browser for React SSR pages e.g. the dashboard (entry.ts must not import React, island bundles must be fully isolated)
- [ ] Only the fee summary page loads the fee calculator island bundle
- [ ] The fee calculator island bundle is independently loadable — no shared runtime chunk required (use `splitting: false` if appropriate)
- [ ] `govuk-frontend` JS is loaded as `type="module" defer` and does not block rendering
- [ ] No SPA framework; no client-side router package in `dependencies`

### Architecture

- [ ] `ReactSSRService.render()` is the only call site for `renderToString` — not called directly in controllers
- [ ] All mock API calls go through `ApiClientService` — no direct `fetch` or `axios` calls in controllers or services
- [ ] React SSR components are pure rendering functions — data fetching happens in NestJS service layer only
- [ ] Island components each have a corresponding no-JS fallback that is always rendered to the DOM
- [ ] NestJS modules are feature-scoped — `AppModule` contains only module imports and global providers
- [ ] Session is the single source of truth for in-progress form data — no hidden form fields for state accumulation

---

## 17. Documentation

Generate the following files:

### `README.md`

Include:
- Prerequisites (Node.js ≥ 20, npm ≥ 10)
- Quick start: `npm install && npm run dev`
- What the PoC demonstrates (3-paragraph prose overview matching the architectural argument in Section 1)
- Developer guide: how to add a new Nunjucks page
- Developer guide: how to add a new React SSR component
- Developer guide: how to add a new React island with fallback
- Developer guide: how to add a new mock API resource

### `ARCHITECTURE.md`

Include:
- A Mermaid diagram showing: Browser → NestJS BFF (three rendering modes annotated) → JSON Server Mock API
- Prose explanation of the three rendering modes: Nunjucks SSR, React SSR (server-only string injection), React island (client mount with fallback)
- A table summarising which pages use which rendering mode
- Rationale for each major technology choice

### `PRINCIPLES.md`

The checklist from Section 15 with each item marked `✅ Met by scaffold` and a one-line explanation of how.

---

## 18. End-to-End Demo Flow

Ensure `mock-api/db.json`, session handling, and route guards are configured so that a developer running the app for the first time can immediately complete this flow in a browser:

1. Visit `http://localhost:3000` — redirects to `/apply/start`
2. Click "Start now" — loads `/apply/claim-type`
3. Select "Money claim" and continue through all form steps (claim type → your details → defendant details → claim details → fee summary → check your answers)
4. On `/apply/fee-summary`: observe the static fee summary server-rendered; if JS is enabled, observe the fee calculator island mount and allow live amount editing
5. On `/apply/check-your-answers`: observe the GOV.UK summary cards
6. Submit → `/apply/confirmation` with a generated reference number
7. Visit `http://localhost:3000/my-applications` — see the seeded application list
8. Filter by status "Hearing Scheduled" — URL updates to `?status=hearing-scheduled`, table filters server-side
9. Search for "ABC" — filters by defendant name server-side
10. Click a reference number → `/dashboard/SC-2024-00123` — observe React SSR dashboard with status timeline etc.
11. Repeat steps 4, 8, and 9 with JavaScript disabled in the browser — every step must provide full equivalent functionality as a fallback (although exact user experience may vary, it should be as close as possible to the UX with JS enabled)

**This end-to-end flow, including step 11 with JavaScript disabled, must work with the generated scaffold without any additional manual setup.**

---
````
