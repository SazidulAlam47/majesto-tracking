# Majesto Tracking

> A lightweight internal task-tracking dashboard for Majesto Limited — built with Next.js, Tailwind CSS and Mongoose.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Install](#install)
    - [Environment Variables](#environment-variables)
    - [Run (dev / build / start)](#run-dev--build--start)
- [Database & Seeding](#database--seeding)
- [Project Structure](#project-structure)
- [Styling & Theming Notes](#styling--theming-notes)
- [Testing & Linting](#testing--linting)
- [Contributing](#contributing)
- [License & Contact](#license--contact)

---

## Project Overview

Majesto Tracking is an internal dashboard used to manage tasks, users, and reports. It provides role-based views for admins and regular users, supports image uploads (Cloudinary), PDF reports, and JWT-based authentication.

## Features

- Role-based access (admin / user)
- Task creation, assignment and status management
- User approval flow (approve / reject)
- Image uploading via Cloudinary
- PDF report generation and downloads
- Lightweight charts and summaries on the homepage

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS (v4) + utility-driven theming
- Mongoose / MongoDB
- Cloudinary for image uploads
- Lucide icons, Recharts, Sonner (toasts)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (recommended) or npm/yarn
- A running MongoDB instance (Atlas or local)
- Cloudinary account (for uploads)

### Install

Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd majesto-tracking
# using pnpm (recommended)
pnpm install
# or with npm
npm install
```

### Environment Variables

Create a `.env.local` file at the project root with the following variables (example values):

```env
# Database
NEXT_PUBLIC_DATABASE_URL=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/majesto?retryWrites=true&w=majority

# Cloudinary (used by client uploader)
NEXT_PUBLIC_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_UPLOAD_PRESET=unsigned_preset

# Admin seed credentials (used by seed script)
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_ADMIN_PASSWORD=changeme

# JWT / Auth
JWT_SECRET=some_long_secret_here
JWT_EXPIRES_IN=7d

# Optional 3rd-party / AI keys
GEMINI_API_KEY=your_generative_ai_key
NEXT_PUBLIC_GEMINI_API_KEY=your_generative_ai_key_public

# Bcrypt salt rounds (optional)
BCRYPT_SALT_ROUNDS=12
```

Notes:

- Cloudinary keys are referenced as `NEXT_PUBLIC_...` for the unsigned client uploader. The server-side secret keys (if used) should not be public.
- The seed script reads `NEXT_PUBLIC_ADMIN_EMAIL` and `NEXT_PUBLIC_ADMIN_PASSWORD` to create an initial admin on first DB connect.

### Run (dev / build / start)

Development:

```bash
pnpm dev
# or
npm run dev
```

Build & start (production):

```bash
pnpm build
pnpm start
# or
npm run build
npm run start
```

### Linting

```bash
pnpm lint
# or
npm run lint
```

## Database & Seeding

The app connects to MongoDB via `src/lib/dbConnect.ts`. On first connection the repository runs a small seed routine to ensure an admin user exists (uses `NEXT_PUBLIC_ADMIN_EMAIL` / `NEXT_PUBLIC_ADMIN_PASSWORD`).

If you want to reset test data, drop the DB or change the seed logic in `src/lib/seed.ts`.

## Project Structure (high level)

- `src/app` — Next.js app routes and layouts (App Router)
- `src/components` — Reusable UI components and page-specific components
    - `shared` — Header, Sidebar, AuthProvider
    - `forms` — Task form, ImageUploader (client-side Cloudinary uploader)
    - `ui` — Primitive UI components (Button, Avatar, Badge, etc.)
- `src/lib` — DB connection and seed helpers
- `src/services` — API client wrappers and business logic
- `src/schemas` — Zod schemas for validation
- `src/utils` — helpers (Cloudinary upload, JWT client helper)

## Styling & Theming Notes

- Tailwind CSS utilities are used throughout.
- `src/app/globals.css` defines CSS variables for light/dark palettes. There is a global rule:

```css
* {
    border-color: var(--border);
}
```

which sets default border color from the current theme token. This means component-level borders can be visually overridden unless they explicitly set a border color.

- The sidebar intentionally uses a dark surface while the rest of the site is light. If you want a consistent light-only look, update `src/app/layout.tsx` to remove any `dark` class and adjust `globals.css` tokens.

## Common Maintenance Tasks

- Change the accent colors: edit `:root` and `.dark` variables in `src/app/globals.css`.
- Update Cloudinary presets: `src/utils/cloudinary.ts` uses `NEXT_PUBLIC_UPLOAD_PRESET` and `NEXT_PUBLIC_CLOUD_NAME`.
- Modify auth expiry/secret: `src/helpers/jwt.ts` reads `JWT_SECRET` and `JWT_EXPIRES_IN`.

## Contributing

1. Fork the repo and create a feature branch.
2. Open a PR with a clear description and related issue.
3. Keep style changes limited and keep UI tokens in `globals.css`.

## Troubleshooting

- If borders appear the wrong color, check `:root` and `.dark` `--border` tokens in `src/app/globals.css`.
- If uploads fail, confirm `NEXT_PUBLIC_CLOUD_NAME` and `NEXT_PUBLIC_UPLOAD_PRESET` and Cloudinary account settings.
- If Mongo fails to connect, verify `NEXT_PUBLIC_DATABASE_URL` and that your IP/atlas rules allow connections.
