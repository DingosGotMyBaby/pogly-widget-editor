import { WidgetData } from "../types/WidgetData";

const WIDGET_CSP = [
  "default-src 'self' data: blob: https: http:;",
  "script-src 'unsafe-inline' data: blob: https: http:;",
  "style-src 'unsafe-inline' data: blob: https: http:;",
  "img-src data: blob: https: http:;",
  "font-src data: blob: https: http:;",
  "media-src data: blob: https: http:;",
  "connect-src data: blob: https: http: ws: wss:;",
  "frame-src data: blob: https: http:;",
].join(" ");

export function compileWidgetToHtml(widget: WidgetData): string {
  const scriptTag = widget.scriptTag.trim().length > 0 ? `<script>${widget.scriptTag}<\/script>` : "";
  const headerTag = `<head><meta charset="UTF-8" /><meta http-equiv="Content-Security-Policy" content="${WIDGET_CSP}" />${widget.headerTag}<style>html { pointer-events: none; } ${widget.styleTag}</style></head>`;
  const bodyTag = `<body>${widget.bodyTag}${scriptTag}</body>`;

  let html = `<!DOCTYPE html><html>${headerTag}${bodyTag}</html>`;

  for (const v of widget.variables) {
    html = html.replaceAll(`{${v.variableName}}`, String(v.variableValue));
  }

  html = html.replaceAll("{is_overlay}", "false");

  if (widget.widgetWidth && widget.widgetHeight) {
    html = html.replaceAll("{widget_width}", String(widget.widgetWidth));
    html = html.replaceAll("{widget_height}", String(widget.widgetHeight));
  }

  return html;
}

export function stringifyWidgetData(widget: WidgetData): string {
  return JSON.stringify(
    {
      widgetName: widget.widgetName,
      widgetWidth: widget.widgetWidth,
      widgetHeight: widget.widgetHeight,
      headerTag: widget.headerTag,
      bodyTag: widget.bodyTag,
      styleTag: widget.styleTag,
      scriptTag: widget.scriptTag,
      variables: widget.variables.filter((v) => v.variableName !== ""),
    },
    null,
    2,
  );
}
