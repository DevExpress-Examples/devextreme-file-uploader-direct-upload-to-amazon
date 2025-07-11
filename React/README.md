# React + TypeScript + Vite + DevExtreme

This template provides a minimal setup to get React working in Vite with HMR, ESLint rules, and DevExtreme components.

This project includes:
- React 18.2.0
- TypeScript 5.8.2
- Vite for fast development and building
- DevExtreme React 24.2.3
- Vitest for testing
- ESLint and Stylelint for code quality

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Getting Started

### Installation

```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building

Build the project for production:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm test
npm run test:watch  # Run tests in watch mode
```

### Linting

Run linting checks:
```bash
npm run lint      # Run all linting checks
npm run lint-ts   # ESLint for TypeScript files
npm run lint-css  # Stylelint for CSS files
```

## Code Structure

**Source Files:**
- `src/App.tsx` - Main React component with DevExtreme Button example
- `src/App.test.tsx` - Tests for the main component
- `src/main.tsx` - Application entry point
- `src/App.css` - Component styles
- `src/index.css` - Global styles
- `src/setupTests.ts` - Test setup configuration
- `src/vite-env.d.ts` - Vite environment type definitions

**Configuration Files:**
- `vite.config.ts` - Vite configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Vitest testing configuration

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

## Further help

You can learn more about React in the [React documentation](https://react.dev/learn).
You can learn more about Vite in the [Vite documentation](https://vite.dev/).
You can learn more about DevExtreme React components in the [DevExtreme React documentation](https://js.devexpress.com/React/).

To get more help on DevExtreme submit an issue in the [Support Center](https://supportcenter.devexpress.com/ticket/create)
