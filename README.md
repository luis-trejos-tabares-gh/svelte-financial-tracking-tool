# Svelte Financial Tracking Tool

A personal finance tracking application built with SvelteKit, styled with Flowbite, backed by Turso (libSQL) via Drizzle ORM, and deployed to Netlify.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [SvelteKit](https://kit.svelte.dev/) + [Vite](https://vitejs.dev/) |
| UI / CSS | [Flowbite](https://flowbite-svelte.com/) + [Tailwind CSS](https://tailwindcss.com/) (with `typography` and `forms` plugins) |
| Database | [Turso](https://turso.tech/) (libSQL) via [Drizzle ORM](https://orm.drizzle.team/) |
| Deployment | [Netlify](https://netlify.com/) via `@sveltejs/adapter-netlify` |
| Package Manager | [pnpm](https://pnpm.io/) |

---

## Prerequisites

- **Node.js** v18+
- **pnpm** — this project uses pnpm workspaces. Do **not** use `npm` or `yarn`, as `workspace:` protocol dependencies will fail to resolve.

```sh
npm install -g pnpm
```

---

## Getting Started

### 1. Clone and Install

```sh
git clone https://github.com/your-username/svelte-financial-tracking-tool.git
cd svelte-financial-tracking-tool
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
```

You can obtain these from the [Turso dashboard](https://app.turso.tech/) after creating a database.

### 3. Run Database Migrations

```sh
pnpm drizzle-kit push
```

### 4. Start the Dev Server

```sh
pnpm dev

# or open in browser automatically
pnpm dev -- --open
```

---

## Building for Production

```sh
pnpm build
```

Preview the production build locally:

```sh
pnpm preview
```

---

## Netlify Deployment

### Adapter

This project uses [`@sveltejs/adapter-netlify`](https://kit.svelte.dev/docs/adapter-netlify), configured in `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-netlify';

export default {
  kit: {
    adapter: adapter()
  }
};
```

### netlify.toml

The `netlify.toml` at the project root sets the build command and forces Netlify to use pnpm. This is required because Netlify defaults to npm, which does not support the `workspace:` protocol used by pnpm.

```toml
[build]
  command = "pnpm run build"
  publish = "build"

[build.environment]
  NPM_FLAGS = "--version"
  PNPM_VERSION = "9"
```

- `NPM_FLAGS = "--version"` prevents Netlify from running `npm install` before the build.
- `PNPM_VERSION` tells Netlify which version of pnpm to install and use.

### Environment Variables on Netlify

Add these in your Netlify site under **Site configuration → Environment variables**:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

---

## Recreating This Project

```sh
pnpm dlx sv@0.15.3 create --template minimal --no-types --add prettier tailwindcss="plugins:typography,forms" --install pnpm app
```
