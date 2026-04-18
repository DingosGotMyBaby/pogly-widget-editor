import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Pogly File System Provider
 * Allows editing parts of the JSON file as native, editable VS Code documents.
 */
class PoglyFileSystemProvider implements vscode.FileSystemProvider {
    private _onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile = this._onDidChangeFile.event;

    constructor() {
        // Watch for changes in the source JSON files to update the virtual files
        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.scheme === 'file' && e.document.fileName.endsWith('.widget.json')) {
                // This is a bit brute force, but effective: notify that all virtual files might have changed
                this._onDidChangeFile.fire([
                    { type: vscode.FileChangeType.Changed, uri: vscode.Uri.parse(`pogly-edit:/header.html?${e.document.uri.toString()}`) },
                    { type: vscode.FileChangeType.Changed, uri: vscode.Uri.parse(`pogly-edit:/body.html?${e.document.uri.toString()}`) },
                    { type: vscode.FileChangeType.Changed, uri: vscode.Uri.parse(`pogly-edit:/style.css?${e.document.uri.toString()}`) },
                    { type: vscode.FileChangeType.Changed, uri: vscode.Uri.parse(`pogly-edit:/script.js?${e.document.uri.toString()}`) }
                ]);
            }
        });
    }

    watch(_uri: vscode.Uri, _options: { recursive: boolean; excludes: string[] }): vscode.Disposable {
        return { dispose: () => { } };
    }

    stat(_uri: vscode.Uri): vscode.FileStat {
        return { type: vscode.FileType.File, ctime: Date.now(), mtime: Date.now(), size: 0 };
    }

    readDirectory(_uri: vscode.Uri): [string, vscode.FileType][] { return []; }
    createDirectory(_uri: vscode.Uri): void { }

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        const sourceUri = vscode.Uri.parse(uri.query);
        const part = uri.path.split('.')[0].substring(1);
        
        try {
            const doc = await vscode.workspace.openTextDocument(sourceUri);
            const json = JSON.parse(doc.getText());
            const key = part === 'header' ? 'headerTag' : part === 'body' ? 'bodyTag' : part === 'style' ? 'styleTag' : 'scriptTag';
            return Buffer.from(json[key] || '');
        } catch {
            return Buffer.from('');
        }
    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, _options: { create: boolean; overwrite: boolean }): Promise<void> {
        const sourceUri = vscode.Uri.parse(uri.query);
        const part = uri.path.split('.')[0].substring(1);
        const newText = Buffer.from(content).toString('utf8');

        const sourceDoc = await vscode.workspace.openTextDocument(sourceUri);
        const json = JSON.parse(sourceDoc.getText());
        const key = part === 'header' ? 'headerTag' : part === 'body' ? 'bodyTag' : part === 'style' ? 'styleTag' : 'scriptTag';
        
        if (json[key] === newText) return;
        json[key] = newText;

        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
            sourceDoc.positionAt(0),
            sourceDoc.positionAt(sourceDoc.getText().length)
        );
        edit.replace(sourceUri, fullRange, JSON.stringify(json, null, 2));
        
        await vscode.workspace.applyEdit(edit);
        await sourceDoc.save();
    }

    delete(_uri: vscode.Uri, _options: { recursive: boolean }): void { }
    rename(_oldUri: vscode.Uri, _newUri: vscode.Uri, _options: { overwrite: boolean }): void { }
}

export function activate(context: vscode.ExtensionContext) {
    const fsProvider = new PoglyFileSystemProvider();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider('pogly-edit', fsProvider, { isCaseSensitive: true }));
    context.subscriptions.push(vscode.window.registerCustomEditorProvider('pogly.dashboard', new PoglyDashboardProvider(context)));
}

class PoglyDashboardProvider implements vscode.CustomTextEditorProvider {
    constructor(private readonly context: vscode.ExtensionContext) {}

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        webviewPanel.webview.options = { enableScripts: true };

        const updateWebview = () => {
            try {
                const json = JSON.parse(document.getText());
                const html = this.compileWidget(json);
                webviewPanel.webview.postMessage({ type: 'update', widget: json, html });
            } catch (e) {
                console.error('Pogly: Preview update failed', e);
            }
        };

        const changeSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });

        webviewPanel.webview.onDidReceiveMessage(async message => {
            const docPath = document.uri.toString();
            switch (message.type) {
                case 'ready':
                    updateWebview();
                    break;
                case 'openPart':
                    const ext = message.part === 'body' || message.part === 'header' ? 'html' : message.part === 'style' ? 'css' : 'js';
                    const uri = vscode.Uri.parse(`pogly-edit:/${message.part}.${ext}?${docPath}`);
                    await vscode.window.showTextDocument(uri, { preview: false, viewColumn: vscode.ViewColumn.Beside });
                    break;
                case 'updateVariables':
                    const json = JSON.parse(document.getText());
                    json.variables = message.variables;
                    const edit = new vscode.WorkspaceEdit();
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    );
                    edit.replace(document.uri, fullRange, JSON.stringify(json, null, 2));
                    await vscode.workspace.applyEdit(edit);
                    await document.save();
                    break;
            }
        });

        webviewPanel.webview.html = this.getHtml(webviewPanel.webview);
        webviewPanel.onDidDispose(() => changeSubscription.dispose());
    }

    private compileWidget(w: any): string {
        const scriptTag = (w.scriptTag || "").trim().length > 0 ? `<script>${w.scriptTag}<\/script>` : "";
        
        let styleContent = w.styleTag || '';
        // Basic Sass-style variable replacement ($var)
        if (Array.isArray(w.variables)) {
            w.variables.forEach((v: any) => {
                if (v.variableName) {
                    const sassRegex = new RegExp('\\$' + v.variableName + '\\b', 'g');
                    styleContent = styleContent.replace(sassRegex, v.variableValue || '');
                }
            });
        }
        // Basic nesting support for the example h1 inside .wrapper
        styleContent = styleContent.replace(/\.wrapper\s*{\s*h1\s*{([^}]*)}\s*}/g, '.wrapper h1 {$1}');

        const head = `
            <head>
                <meta charset="UTF-8">
                ${w.headerTag || ''}
                <!-- -->
                <style>
                    body { margin: 0; overflow: hidden; background: transparent; color: white; font-family: sans-serif; }
                    ${styleContent}
                </style>
            </head>`;
            
        const body = `<body>${w.bodyTag || ''}${scriptTag}</body>`;
        let html = `<!DOCTYPE html><html>${head}${body}</html>`;
        
        if (Array.isArray(w.variables)) {
            w.variables.forEach((v: any) => {
                if (v.variableName) {
                    const regex = new RegExp('{' + v.variableName + '}', 'g');
                    html = html.replace(regex, v.variableValue || '');
                }
            });
        }
        
        return html;
    }

    private getHtml(webview: vscode.Webview): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src * blob: data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
            <style>
                body { font-family: -apple-system, sans-serif; padding: 25px; color: #eee; background: #1a1a1a; display: flex; flex-direction: column; height: 100vh; box-sizing: border-box; margin: 0; }
                .section { margin-bottom: 25px; }
                .label { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 12px; font-weight: 700; letter-spacing: 0.1em; }
                .toolbar { display: flex; gap: 8px; flex-wrap: wrap; }
                button { background: #3c3c3c; color: white; border: 1px solid #454545; padding: 8px 14px; cursor: pointer; border-radius: 4px; font-size: 12px; }
                button:hover { background: #4c4c4c; }
                #preview-container { 
                    flex: 1; 
                    min-height: 200px; 
                    background: #222; 
                    border: 1px solid #333; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    position: relative; 
                    overflow: auto; 
                    border-radius: 4px; 
                    background-image: linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
                    background-size: 20px 20px;
                }
                .widget-frame { 
                    background: transparent; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
                    position: relative; 
                    outline: 1px dashed #555;
                }
                iframe { border: none; width: 100%; height: 100%; display: block; background: transparent; }
                .var-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #252525; border-radius: 4px; }
                .var-table th { text-align: left; padding: 10px 12px; border-bottom: 1px solid #333; color: #888; background: #2a2a2a; }
                .var-table td { padding: 6px 12px; border-bottom: 1px solid #222; }
                input { background: #1e1e1e; border: 1px solid #3c3c3c; color: #eee; padding: 6px 10px; width: 100%; box-sizing: border-box; border-radius: 2px; }
            </style>
        </head>
        <body>
            <div class="section">
                <div class="label">Edit Components</div>
                <div class="toolbar">
                    <button onclick="openPart('header')">Header</button>
                    <button onclick="openPart('body')">Body (HTML)</button>
                    <button onclick="openPart('style')">Styles (CSS)</button>
                    <button onclick="openPart('script')">Logic (JS)</button>
                </div>
            </div>
            <div class="label">Live Preview</div>
            <div id="preview-container" class="section">
                <div id="frame" class="widget-frame">
                    <iframe id="iframe" sandbox="allow-scripts allow-same-origin"></iframe>
                </div>
            </div>
            <div class="section">
                <div class="label">Variables</div>
                <table class="var-table">
                    <thead><tr><th style="width: 30%">Name</th><th>Value</th></tr></thead>
                    <tbody id="var-body"></tbody>
                </table>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                let currentWidget = null;
                window.addEventListener('message', e => {
                    if (e.data.type === 'update') {
                        currentWidget = e.data.widget;
                        const frame = document.getElementById('frame');
                        frame.style.width = (e.data.widget.widgetWidth || 100) + 'px';
                        frame.style.height = (e.data.widget.widgetHeight || 100) + 'px';
                        document.getElementById('iframe').srcdoc = e.data.html;
                        const body = document.getElementById('var-body');
                        body.innerHTML = '';
                        (e.data.widget.variables || []).forEach((v, i) => {
                            const tr = document.createElement('tr');
                            tr.innerHTML = '<td>' + v.variableName + '</td><td><input value="' + (v.variableValue || '') + '" onchange="updateVar(' + i + ', this.value)"></td>';
                            body.appendChild(tr);
                        });
                    }
                });
                function openPart(part) { vscode.postMessage({ type: 'openPart', part }); }
                function updateVar(index, val) {
                    currentWidget.variables[index].variableValue = val;
                    vscode.postMessage({ type: 'updateVariables', variables: currentWidget.variables });
                }
                vscode.postMessage({ type: 'ready' });
            </script>
        </body>
        </html>`;
    }
}
