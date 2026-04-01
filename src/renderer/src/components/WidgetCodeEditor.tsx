import { useCallback, useEffect, useRef } from "react";
import MonacoEditor, { BeforeMount, OnMount } from "@monaco-editor/react";
import { WidgetVariableType, VariableValueType } from "../types/WidgetData";

interface IProps {
  language: string;
  path: string;
  value: string;
  onChange: (value: string) => void;
  variables: WidgetVariableType[];
}

const handleEditorBeforeMount: BeforeMount = (monaco) => {
  const langs = monaco.languages as any;
  langs.css.cssDefaults.setOptions({ validate: false });
  langs.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });
  langs.html.htmlDefaults.setModeConfiguration({
    ...langs.html.htmlDefaults.modeConfiguration,
    diagnostics: false,
  });

  monaco.editor.defineTheme("pogly-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#090b12",
      "editor.foreground": "#9cb3ff",
      "editorLineNumber.foreground": "#aeb4d4",
      "editorLineNumber.activeForeground": "#e9eeff",
      "editor.lineHighlightBackground": "#1e212b",
      "editorCursor.foreground": "#82a5ff",
      "editor.selectionBackground": "#82a5ff33",
      "editorWidget.background": "#10121a",
      "editorWidget.border": "#14151b",
      "editorSuggestWidget.background": "#10121a",
      "editorSuggestWidget.border": "#14151b",
      "editorSuggestWidget.selectedBackground": "#1e212b",
    },
  });

  monaco.languages.registerCompletionItemProvider("html", {
    triggerCharacters: [">"],
    provideCompletionItems: (model, position) => {
      const codePre = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const tag = codePre.match(/.*<(\w+)>$/)?.[1];
      if (!tag) return;
      const word = model.getWordUntilPosition(position);
      return {
        suggestions: [
          {
            label: `</${tag}>`,
            kind: monaco.languages.CompletionItemKind.EnumMember,
            insertText: `$1</${tag}>`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            },
          },
        ],
      };
    },
  });
};

const WidgetCodeEditor = ({ language, path, value, onChange, variables }: IProps) => {
  const variablesRef = useRef<WidgetVariableType[]>(variables);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    variablesRef.current = variables;
  }, [variables]);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editor.updateOptions({ suggest: { selectionMode: "whenQuickSuggestion" } });

    const disposables = ["javascript", "html", "css"].map((lang) =>
      monaco.languages.registerCompletionItemProvider(lang, {
        triggerCharacters: ["{"],
        provideCompletionItems(model, position) {
          const textBefore = model.getValueInRange({
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: Math.max(1, position.column - 1),
            endColumn: position.column,
          });
          if (textBefore !== "{") return { suggestions: [] };

          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          return {
            suggestions: variablesRef.current.map((v) => ({
              label: `{${v.variableName}}`,
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: v.variableName,
              detail: `Widget variable (${VariableValueType[v.variableType]})`,
              range,
              preselect: false,
            })),
          };
        },
      }),
    );

    editor.onDidDispose(() => disposables.forEach((d) => d.dispose()));

    const container = containerRef.current;
    if (container) {
      const ro = new ResizeObserver(() => {
        editor.layout({ width: container.clientWidth, height: container.clientHeight });
      });
      ro.observe(container);
      editor.onDidDispose(() => ro.disconnect());
    }
  }, []);

  return (
    <div ref={containerRef} className="h-full">
      <MonacoEditor
        height="100%"
        language={language}
        path={path}
        value={value}
        onChange={(val) => onChange(val ?? "")}
        theme="pogly-dark"
        beforeMount={handleEditorBeforeMount}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 12,
          fontFamily: '"Fira code", "Fira Mono", monospace',
          scrollBeyondLastLine: false,
          tabSize: 2,
          padding: { top: 14, bottom: 14 },
          automaticLayout: false,
          renderLineHighlight: "line",
        }}
      />
    </div>
  );
};

export default WidgetCodeEditor;
