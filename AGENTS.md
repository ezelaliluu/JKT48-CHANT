# JKT48 CHANT

React + Vite + Tailwind CSS project for JKT48 fans.

## Development

- Start dev server: \
pm run dev\
- Build production: \
pm run build\
- Preview: \
pm run preview\

## Project Structure

- \src/main.tsx\ - React entrypoint; imports \src/index.css\ and mounts \src/App.tsx\ into \#root\
- \src/App.tsx\ - Primary application component
- \src/index.css\ - Global CSS entrypoint and Tailwind CSS v4 theme definitions
- \index.html\ - HTML shell
- \package.json\ - Project dependencies and scripts
- \ite.config.ts\ - Vite configuration with React, Tailwind CSS v4, and \@\ alias for \src\

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with \@tailwindcss/vite\
- Build tooling: Vite 8, TypeScript 5.7, and \@vitejs/plugin-react\
