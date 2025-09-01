<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/15xC3qOFauft7_DJe1292qtTFaDUyO5TL

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## TypeScript Configuration

This project uses [TypeScript](https://www.typescriptlang.org/) with a modern configuration optimized for React development with Vite. The key `compilerOptions` in `tsconfig.json` are configured as follows:

### Core Compilation Settings
- **target**: `"ES2022"` - Compiles TypeScript to ECMAScript 2022, providing modern JavaScript features
- **module**: `"ESNext"` - Uses the latest ES module syntax for optimal tree shaking and modern bundling
- **moduleResolution**: `"bundler"` - Optimized for bundler environments like Vite, enabling better module resolution

### React & JSX Support
- **jsx**: `"react-jsx"` - Uses the modern JSX transform (React 17+) without requiring `import React`
- **allowJs**: `true` - Allows JavaScript files alongside TypeScript, useful for gradual migration
- **experimentalDecorators**: `true` - Enables experimental decorator syntax for advanced TypeScript features

### Type Checking & Libraries
- **lib**: `["ES2022", "DOM", "DOM.Iterable"]` - Includes ES2022 features, DOM APIs, and iterable types for web development
- **skipLibCheck**: `true` - Skips type checking of declaration files for faster compilation
- **types**: `["node"]` - Includes Node.js type definitions for common Node APIs
- **isolatedModules**: `true` - Treats each file as a separate module, ensuring better module boundaries
- **moduleDetection**: `"force"` - Forces the module system to be consistent across the codebase

### Development Experience
- **noEmit**: `true` - Vite handles the compilation process, no separate TypeScript compilation needed
- **allowImportingTsExtensions**: `true` - Allows importing `.ts`/`.tsx` files directly in development
- **useDefineForClassFields**: `false` - Uses legacy class field behavior for compatibility with existing code patterns

### Path Aliases
- **paths**: `{"@/*": ["./*"]}` - Sets up `@/` as an alias for the project root, enabling clean imports like `import Button from '@/components/Button'`

### Why This Configuration?
This setup is optimized for:
- **Performance**: Modern target and bundler-native module resolution
- **Developer Experience**: JSX transform, path aliases, and flexible module handling
- **Compatibility**: Support for both JS and TS files, experimental features when needed
- **Vite Integration**: No emission needed as Vite handles TypeScript compilation
