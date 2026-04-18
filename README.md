# Pogly Widget Editor

A native VS Code extension for building and previewing Pogly Widgets. 

This extension transforms the experience of editing `*.widget.json` files by providing a visual "Dashboard" hub and delegating code editing to VS Code's native, world-class editors.

## Major Disclaimer

This was created using the Gemini CLI by converting the [amazing work that Dynny did](https://github.com/PoglyApp/pogly-widget-editor) and turning it into literal shit. The "author" (Dingo) of this extension if a lazy cunt and couldn't be fucked doing it himself.

## 🚀 Features

- **Pogly Dashboard:** A visual hub for your widget that provides a live, real-time preview of your changes.
- **Native Editing Experience:** Edit HTML, CSS, and JS components in standard VS Code tabs. This means full support for **GitHub Copilot, Prettier, Emmet**, and your favorite keybindings.
- **Intellisense & Validation:** Full JSON Schema support for `*.widget.json` files, providing auto-completion and documentation tooltips.
- **Bi-directional Sync:** Changes made in the Dashboard, the individual component tabs, or the raw JSON are kept perfectly in sync.
- **Sass-Lite Support:** Preview your widgets using Pogly-style Sass variables (`$color`) directly in the browser.
- **Variable Management:** A dedicated table in the dashboard for managing your widget's dynamic variables.

## 🛠 How it Works: The Hub-and-Spoke Model

1. **The Hub (Dashboard):** When you open a `.widget.json` file, the **Pogly Dashboard** launches. This shows your live preview and the variables table.
2. **The Spokes (Components):** Clicking "Edit HTML", "Edit CSS", or "Edit JS" opens a "Virtual Document" (using the `pogly-edit:/` scheme). 
3. **The Workflow:** 
   - You edit the code in a native VS Code tab.
   - You press **Save (Cmd+S)**.
   - The extension automatically updates the underlying JSON file and refreshes the Dashboard preview.

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [Visual Studio Code](https://code.visualstudio.com/)

### Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build the Extension:**
   ```bash
   npm run build
   ```

3. **Run/Debug:**
   - Press `F5` to launch the **Extension Development Host**.
   - Open `example.widget.json` in the new window.
   - Use the Dashboard buttons to start editing.

## 📂 Project Structure

- `src/extension/extension.ts`: The core logic, including the Custom Editor provider and the Virtual File System provider.
- `resources/widget-schema.json`: The JSON Schema that powers Intellisense for widget files.
- `example.widget.json`: A sample widget to get you started.

## 📜 Scripts

- `npm run build`: Bundles the extension into `out/extension.js` using esbuild.
- `npm run watch`: Starts esbuild in watch mode for active development.
- `npm run compile`: Alias for build.
- `npm run package`: Packages the extension into a `.vsix` file for distribution.

## 🚀 Releasing

This project uses **GitHub Actions** to automate releases. When changes are pushed or merged into the `main` branch:
1. The extension is automatically built and packaged.
2. A new GitHub Release is created using the version from `package.json`.
3. The `.vsix` artifact is attached to the release for easy download and installation.

To trigger a manual release:
1. Increment the version in `package.json`.
2. Push to `main`.
