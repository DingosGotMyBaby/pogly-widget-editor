const WidgetReadme = () => (
  <div className="p-5 h-full overflow-auto space-y-5 text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
    <section>
      <p className="text-[15px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
        Widget Overview
      </p>
      <p style={{ color: "var(--color-text-muted)" }} className="leading-relaxed">
        Widgets are custom overlay elements built from raw HTML, CSS, and JavaScript. Each widget is composed of four
        code files that are injected into an isolated iframe at render time. Widgets support a variable system that lets
        you expose configurable values without editing code.
      </p>
    </section>

    <Divider />

    <section>
      <p className="text-[14px] font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
        Code Files
      </p>
      <div className="space-y-3">
        <DocBlock dotColor="#fb923c" label="header.html">
          <p>
            Content injected into the <code>&lt;head&gt;</code> of the iframe. Use this for external resource links,
            meta tags, or any markup that must appear before the body renders.
          </p>
          <DocExample>{`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap">`}</DocExample>
        </DocBlock>

        <DocBlock dotColor="#fb923c" label="body.html">
          <p>The visible HTML of your widget. Add any elements here that you want to display on the overlay.</p>
          <DocExample>{`<div id="container">\n  <span id="label">{my_text}</span>\n</div>`}</DocExample>
        </DocBlock>

        <DocBlock dotColor="#38bdf8" label="style.css">
          <p>Styles scoped to this widget's iframe. All standard CSS is supported.</p>
          <DocExample>{`#container {\n  font-family: 'Inter', sans-serif;\n  color: {text_color};\n}`}</DocExample>
        </DocBlock>

        <DocBlock dotColor="#facc15" label="script.js">
          <p>JavaScript that runs inside the widget iframe after the DOM is ready.</p>
          <p className="mt-1" style={{ color: "var(--color-warning)" }}>
            Avoid infinite <code>while</code> loops — they will freeze the iframe.
          </p>
          <DocExample>{`const label = document.getElementById('label');\nsetInterval(() => {\n  label.textContent = new Date().toLocaleTimeString();\n}, 1000);`}</DocExample>
        </DocBlock>
      </div>
    </section>

    <Divider />

    <section>
      <p className="text-[14px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
        Variable System
      </p>
      <p className="mb-3 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        Define variables in the <strong>variables</strong> tab, then reference them anywhere with{" "}
        <code>{"{variable_name}"}</code>. The placeholder is replaced at render time.
      </p>
      <div className="space-y-2">
        <VarTypeRow name="string" color="#a78bfa">Any text or numeric value.</VarTypeRow>
        <VarTypeRow name="boolean" color="#a78bfa">
          A true/false toggle rendered as <code>"true"</code> or <code>"false"</code>.
        </VarTypeRow>
        <VarTypeRow name="toggle" color="#a78bfa">Identical to boolean — displayed as a toggle switch.</VarTypeRow>
        <VarTypeRow name="color" color="#a78bfa">A hex color string (e.g. <code>#ff0000</code>).</VarTypeRow>
        <VarTypeRow name="image" color="#a78bfa">A URL or data URI for an image.</VarTypeRow>
      </div>

      <p className="text-[13px] font-semibold mt-4 mb-2" style={{ color: "var(--color-text-secondary)" }}>
        System Variables
      </p>
      <div className="space-y-2">
        <VarTypeRow name="{is_overlay}" color="#64748b">Always <code>"false"</code> in the standalone editor.</VarTypeRow>
        <VarTypeRow name="{widget_width}" color="#64748b">The default width of the widget in pixels.</VarTypeRow>
        <VarTypeRow name="{widget_height}" color="#64748b">The default height of the widget in pixels.</VarTypeRow>
      </div>
    </section>

    <Divider />

    <section>
      <p className="text-[14px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
        Import &amp; Export
      </p>
      <p className="leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        Use <strong>File &rarr; Save</strong> / <strong>Open</strong> to persist widgets as local JSON files. The export
        tab shows the raw JSON string you can copy to share. The import tab lets you paste a JSON string to load a widget
        without overwriting your current file.
      </p>
    </section>

    <Divider />

    <section>
      <p className="text-[14px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
        Tips &amp; Gotchas
      </p>
      <ul className="space-y-2 list-disc list-inside leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        <li>Variable substitution is a simple string replacement across all files.</li>
        <li>
          Reserved names: <code>is_overlay</code>, <code>widget_width</code>, <code>widget_height</code>.
        </li>
        <li>Press <kbd>Ctrl+S</kbd> to save. Middle-click or click × to close a tab.</li>
      </ul>
    </section>
  </div>
);

const Divider = () => <div style={{ height: 1, background: "var(--color-border-dark)" }} />;

const DocBlock = ({ dotColor, label, children }: { dotColor: string; label: string; children: React.ReactNode }) => (
  <div style={{ background: "var(--color-body)", borderRadius: 8, padding: "10px 14px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0, display: "inline-block" }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", fontFamily: "monospace" }}>{label}</span>
    </div>
    <div style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{children}</div>
  </div>
);

const DocExample = ({ children }: { children: string }) => (
  <pre style={{ marginTop: 8, padding: "8px 10px", background: "var(--color-base)", borderRadius: 6, fontSize: 11, color: "var(--color-accent-muted)", overflowX: "auto", fontFamily: '"Fira code", "Fira Mono", monospace', whiteSpace: "pre" }}>
    {children}
  </pre>
);

const VarTypeRow = ({ name, color, children }: { name: string; color: string; children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 10, background: "var(--color-body)", borderRadius: 7, padding: "8px 12px", alignItems: "flex-start" }}>
    <code style={{ color, fontFamily: '"Fira code","Fira Mono",monospace', fontSize: 12, flexShrink: 0, paddingTop: 1 }}>{name}</code>
    <span style={{ fontSize: 12, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{children}</span>
  </div>
);

export default WidgetReadme;
