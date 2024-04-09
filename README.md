# Mello 
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build](https://github.com/bnlabs/mello/actions/workflows/build.yml/badge.svg)](https://github.com/bnlabs/mello/actions/workflows/build.yml)
[![SonarCloud scan](https://github.com/bnlabs/mello/actions/workflows/sonarcloud.yaml/badge.svg)](https://github.com/bnlabs/mello/actions/workflows/sonarcloud.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=bnlabs_mello&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=bnlabs_mello)
[![CodeFactor](https://www.codefactor.io/repository/github/bnlabs/mello/badge)](https://www.codefactor.io/repository/github/bnlabs/mello)
# What is Mello?
Mello is a web app for screen sharing through web browser.
This service works by using the webrtc protocol and websocket to establish the connection between users. After the connection is established, streaming is peer-to-peer.

# Why was Mello created?
Mello was created to offer an alternative to Discord's screen sharing feature. While Discord's screen sharing is limited to 720p for non-Nitro users and can be unreliable at times, Mello aims to provide a more reliable solution with higher quality streaming, all available for free. The motivation behind creating Mello stems from a desire to enhance the user experience by ensuring consistency and reliability in screen sharing.

## Setup
Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# Self-host
