# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Next.js 16)
npm run build    # Production build
npm run lint     # ESLint (v9 flat config)
```

Backend runs at `http://localhost:8000` (configured via `NEXT_PUBLIC_API_URL`).

## Architecture

**Aquator SMS Agent** — Romanian-language CRM for managing clients and SMS reminder programs. Built with Next.js 16 (App Router), React 19, Redux Toolkit, CSS Modules, TypeScript (strict).

### Data flow

`app/home/page.tsx` is the main page. It manages filter state, debounced search, and infinite scroll pagination (50 items/page, max 6 pages). URL query params stay in sync with filters.

API calls go through Redux async thunks (`store/slices/clients/thunks.ts`) which call Axios (`lib/api.ts`) then dispatch slice actions. Some mutations use **optimistic updates** — the Redux action dispatches before the API call, so the UI updates instantly.

The `SmsTable` component manages its own local state for SMS program rows, using temp IDs (`_temp_` prefix) for unsaved rows and direct `api.*` calls instead of thunks. It merges Redux rows with local rows for display.

### State management

Single Redux slice (`clients`) holds: client list, pagination totals, selected client, and filter resources. All client/order/program CRUD flows through this slice.

Theme (dark/light) uses React Context (`lib/theme-context.tsx`), not Redux.

### Styling

CSS Modules per component. Global variables for theming in `app/globals.css` with `[data-theme="dark"]` / `[data-theme="light"]` selectors. Uses CSS custom properties for colors, spacing, radii.

### Key conventions

- All components are `"use client"` (client-side rendering)
- Path alias: `@/*` maps to project root
- Dates stored as `yyyy-mm-dd` (ISO), displayed as `dd / mm / yyyy` via `lib/date-format.ts`
- Phone numbers validated and normalized to Romanian `+40` format via `lib/phone-validation.ts`
- UI language is Romanian throughout
- The search toolbar is `position: sticky` at the top of the page
- Delete operations show a `ConfirmModal` for confirmation
