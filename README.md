# Letra

A Spanish-learning songbook that turns songs into translated study material and quizzes.
Built by Jacob Ramón using AI-assisted development.

## Features
- Catalog song search and public Spotify playlist-preview import.
- Free lyric lookup with LRCLIB and lyrics.ovh, version matching, fallback handling, and source attribution.
- Browser-based Spanish/English translation using Transformers.js and quantized Marian models, with a resumable queue and per-line saving.
- Saved songbooks and quiz progress, Clerk authentication, and user-scoped Neon Postgres storage.

## Stack
Next.js, React, TypeScript, Clerk, Neon Postgres, Transformers.js; hosted on Vercel.

## Run locally
1. Use Node.js 22 or newer and run `npm ci`.
2. Copy `.env.example` to `.env.local` and supply your own Clerk and Neon configuration.
3. Run `npm run db:migrate`, then `npm run dev`.
4. `npm run build` builds the app and regenerates the UI shell from `public/app.html`.

## Checks
`npx tsc --noEmit` and `node tests/playlist-client.cjs`.
The lyric and Spotify tests also contain live network checks: `node tests/lyrics.mjs` and `node tests/spotify-playlist.mjs`.

## Boundaries
Public playlist previews may be incomplete. Lyrics may be unavailable or require version selection. Translation runs while the browser remains open and needs an initial model download. Third-party lyrics are retrieved at runtime; no personal songbook or lyric collection is included here. Respect provider terms and applicable content rights.

## Source snapshot
This repository contains the current Vercel application. Legacy hosting copies, production repair scripts, private environments, deployment identifiers, and user records are excluded. Configure your own services before deployment; the original deployment is access-protected.
