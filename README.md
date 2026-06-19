[![CI](https://github.com/your-org/cbt-os/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/cbt-os/actions/workflows/ci.yml)

# CBT OS

Cognitive Behavioral Therapy operating system — a Next.js application for managing CBT workflows, patients, and treatment plans.

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (for database and auth)
- Vercel account (for deployment)

## Setup

1. Clone the repository:

```bash
git clone https://github.com/your-org/cbt-os.git
cd cbt-os
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Development

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server with hot reload |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type check without emitting |
| `npm run test:run` | Run tests once |
| `npm run test` | Run tests in watch mode |
| `npm run build` | Production build |

## Testing

Tests use Vitest with React Testing Library and jsdom.

```bash
# Run all tests once
npm run test:run

# Run in watch mode during development
npm run test
```

Place test files next to their source files or in `__tests__/` directories with the `.test.tsx` or `.test.ts` extension.

## CI/CD

### CI Pipeline

Every push to `main` and every pull request triggers the CI workflow (`.github/workflows/ci.yml`):

1. Install dependencies
2. Lint
3. Type check
4. Run tests
5. Build

All steps must pass before a PR can be merged.

### Deployment

Pushing to `main` triggers automatic deployment to Vercel (`.github/workflows/deploy.yml`).

**Required secret:** Add `VERCEL_TOKEN` to your repository secrets (Settings → Secrets and variables → Actions).

### Dependency Updates

Dependabot (`.github/dependabot.yml`) opens weekly PRs for minor and patch dependency updates, grouped into a single PR per update type.

## Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

See `.env.example` for the full list.

## Project Structure

```
src/
├── app/            # Next.js App Router pages and layouts
├── components/     # React components
├── lib/            # Utility functions and helpers
├── store/          # Zustand state management
└── types/          # TypeScript type definitions
```

## License

Private — not for public distribution.
