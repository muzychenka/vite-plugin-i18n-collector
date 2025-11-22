# vite-plugin-i18n-collector

[![npm version](https://img.shields.io/npm/v/vite-plugin-i18n-collector)](https://www.npmjs.com/package/vite-plugin-i18n-collector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Vite plugin that automatically collects and merges i18n translation files from anywhere in your directory into a single JSON bundle with full hot-reload support

## ✨ Features

-   🔍 **Automatic Discovery** - Recursively finds all translation files matching your language patterns
-   🔄 **Hot Module Replacement** - Instant updates when translation files change during development
-   📦 **Smart Merging** - Combines multiple translation files into unified bundles per language
-   ⚡ **Easy Configuration** - Works out of the box with minimal setup
-   🌳 **Tree Shaking** - Source translation files are not included in the build bundle

## 📦 Installation

```bash
npm install -D vite-plugin-i18n-collector
# or
pnpm add -D vite-plugin-i18n-collector
# or
yarn add -D vite-plugin-i18n-collector
```

## 🚀 Usage

### Basic Setup

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import path from 'path'
import i18nCollector from 'vite-plugin-i18n-collector'

export default defineConfig({
    plugins: [
        i18nCollector({
            languages: ['en', 'es', 'de'],
            lookupDir: path.join(process.cwd(), 'src'),
            saveDir: path.join(process.cwd(), 'src/locales')
        })
    ]
})
```

### Configuration Options

| Option      | Type       | Required | Description                                               |
| ----------- | ---------- | -------- | --------------------------------------------------------- |
| `languages` | `string[]` | ✅       | Array of language codes to collect (e.g., `['en', 'de']`) |
| `lookupDir` | `string`   | ✅       | Directory to search for translation files                 |
| `saveDir`   | `string`   | ✅       | Directory where merged translation files will be saved    |

## 📁 File Structure

The plugin searches for files matching the pattern `{language}.json` (e.g., `en.json`, `en.json`) in the `lookupDir` and all its subdirectories.

### Example Structure

```
src/
├── components/
│   ├── Button/
│   │   └── en.json          # {"button": "Click me"}
│   └── Modal/
│       └── en.json          # {"close": "Close"}
├── pages/
│   └── Home/
│       └── en.json          # {"title": "Welcome"}
└── locales/
    └── en.json              # Generated: merged all en.json files
```

After running the plugin, `src/locales/en.json` will contain:

```json
{
    "button": "Click me",
    "close": "Close",
    "title": "Welcome"
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request

## 📄 License

MIT © [Dzmitry Muzychenka](https://github.com/muzychenka/vite-plugin-i18n-collector/blob/main/LICENSE)
