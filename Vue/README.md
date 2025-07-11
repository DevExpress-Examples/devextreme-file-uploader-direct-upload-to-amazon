# Vue 3 + TypeScript + Vite + DevExtreme

This template should help get you started developing with Vue 3 in Vite and DevExtreme components.

This project includes:
- Vue 3.2.45
- TypeScript 4.7.4
- Vite for fast development and building
- DevExtreme Vue 24.2.3
- Vue Router 4.1.6
- Vitest for testing
- ESLint and Prettier for code quality

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/vuejs/language-tools/discussions/471) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

## Code Structure

**Source Files:**
- `src/App.vue` - Main Vue application component with router
- `src/main.ts` - Application entry point
- `src/components/HomeContent.vue` - Example component with DevExtreme Button
- `src/components/__tests__/` - Component tests
- `src/views/HomeView.vue` - Home page view
- `src/router/index.ts` - Vue Router configuration
- `src/assets/` - Static assets

**Configuration Files:**
- `vite.config.ts` - Vite configuration with Vue and DevExtreme optimizations
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tsconfig.vitest.json` - Vitest-specific TypeScript configuration

### Compile and Hot-Reload for Development

```sh
npm run dev
```

The application will be available at `http://localhost:5173/`

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
### Further help

You can learn more about Vue in the [Vue documentation](https://vuejs.org/guide/introduction.html).
You can learn more about Vite in the [Vite documentation](https://vite.dev/).
You can learn more about DevExtreme Vue components in the [DevExtreme Vue documentation](https://js.devexpress.com/Vue/).

To get more help on DevExtreme submit an issue on [GitHub](https://github.com/DevExpress/devextreme/issues) or [Support Center](https://supportcenter.devexpress.com/ticket/create)