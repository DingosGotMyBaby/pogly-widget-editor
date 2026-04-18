# Pogly Widget Editor - Agent Guide

This project is a native VS Code extension for building and previewing Pogly Widgets. It uses a **Hub-and-Spoke** architecture to provide a rich editing experience using standard VS Code features.

## Architecture Overview

### 1. The Dashboard (Custom Editor)
The entry point for `*.widget.json` files is the **Pogly Dashboard** (`src/extension/extension.ts`).
- It renders as a Custom Editor using a Webview.
- It acts as the "Hub", providing a live preview and buttons to open individual components.
- It handles bi-directional synchronization between the JSON state and the UI.

### 2. Virtual File System (`pogly-edit:/`)
To allow editing JSON properties (HTML, CSS, JS) as native files, the extension implements a `FileSystemProvider`.
- **Scheme:** `pogly-edit`
- **Path Pattern:** `pogly-edit:/<part>.<ext>?<source-json-uri>`
- **Behavior:** Reading from this scheme extracts the string from the source JSON. Writing to it performs a `WorkspaceEdit` on the source JSON and saves it to disk.
- **Benefit:** This allows users to use **GitHub Copilot, Prettier, Emmet**, and other standard extensions on individual parts of the widget.

### 3. Widget Compiler
The extension host pre-compiles the widget into a single HTML blob before sending it to the webview.
- **Variable Injection:** Replaces `{VariableName}` in HTML/JS with values from the `variables` array.
- **Sass-Lite:** Performs basic replacement of `$VariableName` in CSS to allow Pogly-style styles to render in the browser.
- **Security:** Uses `srcdoc` within an iframe with restricted `sandbox` permissions.

## Project Structure

- `src/extension/extension.ts`: The entire extension logic (Dashboard, FS Provider, Compiler).
- `resources/widget-schema.json`: JSON Schema for `*.widget.json`, providing Intellisense and validation.
- `package.json`: Extension metadata and contribution points.
- `example.widget.json`: A reference implementation of a Pogly widget.

## Development Workflow

1. **Build:** `npm run build` (uses esbuild for fast bundling).
2. **Run:** Press `F5` to launch the Extension Development Host.
3. **Debug:** Use the VS Code "Toggle Developer Tools" to debug the Webview or the "Extension Host" console for the logic.

## Key Constraints for Agents
- **No Heavy Frontends:** Do not add React, Vite, or Monaco to the webview. The goal is to keep the webview as a lightweight "Dashboard" and delegate editing to the VS Code core.
- **Bi-directional Sync:** Always ensure that changes in the Dashboard, the Virtual Files, and the raw JSON stay in sync via `onDidChangeTextDocument` listeners.
- **Standard APIs:** Prefer `vscode.WorkspaceEdit` for modifications to ensure undo/redo history is preserved for the user.
