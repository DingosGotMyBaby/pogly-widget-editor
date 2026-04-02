import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Code2, Copy, Minimize, X } from "lucide-react";
import styled from "styled-components";
import { WidgetData, WidgetVariableType } from "../types/WidgetData";
import { stringifyWidgetData } from "../utils/widgetCodeCompiler";
import { Button } from "./inputs/Button";
import { WidgetControlsView } from "./WidgetControlsView";
import { WidgetInfo, WidgetVariableTable } from "./WidgetVariableTable";
import WidgetSidebar from "./WidgetSidebar";
import WidgetTabs from "./WidgetTabs";
import WidgetCodeEditor from "./WidgetCodeEditor";
import WidgetPreview from "./WidgetPreview";
import WidgetReadme from "./WidgetReadme";
import WidgetFooter from "./WidgetFooter";
import { TabId, TAB_CONTROLS, TAB_IMPORT, TAB_PREVIEW } from "../types/EditorTypes";

interface EditorFile extends TabId {
  filename: string;
  monacoLanguage: string;
}

const EDITOR_FILES: EditorFile[] = [
  { id: "header", color: "#fb923c", label: "header.html", filename: "header.html", monacoLanguage: "html" },
  { id: "body", color: "#fb923c", label: "body.html", filename: "body.html", monacoLanguage: "html" },
  { id: "style", color: "#38bdf8", label: "style.css", filename: "style.css", monacoLanguage: "css" },
  { id: "script", color: "#facc15", label: "script.js", filename: "script.js", monacoLanguage: "javascript" },
];

const PREVIEW_SPLIT_KEY = "widgetIDE_previewSplit";
const electronAPI = (window as any).electronAPI;

interface IProps {
  value: WidgetData;
  onChange: (next: WidgetData) => void;
  isDirty: boolean;
  saveDirectory: string | null;
  onChooseSaveDirectory: () => void;
  onClearSaveDirectory: () => void;
  onSave: () => void;
  onNew: () => void;
  onOpen: () => void;
}

export const WidgetEditor = ({
  value,
  onChange,
  isDirty,
  saveDirectory,
  onChooseSaveDirectory,
  onClearSaveDirectory,
  onSave,
  onNew,
  onOpen,
}: IProps) => {
  const [openTabs, setOpenTabs] = useState<TabId[]>([TAB_CONTROLS]);
  const [activeTab, setActiveTab] = useState<TabId | null>(TAB_CONTROLS);
  const tabStripRef = useRef<HTMLDivElement>(null);
  const editorPaneRef = useRef<HTMLDivElement>(null);
  const lastNonPreviewTabRef = useRef<TabId | null>(TAB_CONTROLS);

  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [importError, setImportError] = useState("");

  const [previewSplitPercent, setPreviewSplitPercent] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(PREVIEW_SPLIT_KEY);
      if (stored) return Number(stored);
    } catch {}
    return 40;
  });
  const previewSplitRef = useRef(previewSplitPercent);
  useEffect(() => {
    previewSplitRef.current = previewSplitPercent;
  }, [previewSplitPercent]);
  const [isResizingPreview, setIsResizingPreview] = useState(false);

  useEffect(() => {
    if (activeTab && activeTab.id !== "preview") lastNonPreviewTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const el = tabStripRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSave]);

  useEffect(() => {
    if (!tabStripRef.current || !activeTab) return;
    tabStripRef.current
      .querySelector<HTMLElement>(`[data-tab="${activeTab?.id}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeTab]);

  const openTab = (id: TabId) => {
    setOpenTabs((prev) => (prev.some((t) => t.id === id.id) ? prev : [...prev, id]));
    setActiveTab(id);
  };

  const closeTabById = (id: TabId) => {
    const remaining = openTabs.filter((t) => t.id !== id.id);
    setOpenTabs(remaining);
    if (activeTab?.id === id.id) setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1] : null);
  };

  const closeTab = (id: TabId, e: React.MouseEvent) => {
    e.stopPropagation();
    closeTabById(id);
  };

  const set = (patch: Partial<WidgetData>) => onChange({ ...value, ...patch });

  const setVariables = (v: WidgetVariableType[] | ((prev: WidgetVariableType[]) => WidgetVariableType[])) => {
    const next = typeof v === "function" ? v(value.variables) : v;
    set({ variables: next });
  };

  const exportString = useMemo(() => stringifyWidgetData(value), [value]);

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(unescape(importCode));
      setImportError("");
      onChange({
        widgetName: parsed.widgetName || "",
        widgetWidth: parsed.widgetWidth || 128,
        widgetHeight: parsed.widgetHeight || 128,
        headerTag: parsed.headerTag || "",
        bodyTag: parsed.bodyTag || "",
        styleTag: parsed.styleTag || "",
        scriptTag: parsed.scriptTag || "",
        variables: parsed.variables || [],
      });
      setImportCode("");
      closeTabById(TAB_IMPORT);
    } catch {
      setImportError("Widget JSON does not parse.");
    }
  };

  const handlePreviewSplitMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    setIsResizingPreview(true);

    const startX = e.clientX;
    const startPercent = previewSplitRef.current;

    const onMouseMove = (ev: MouseEvent) => {
      const paneEl = editorPaneRef.current;
      if (!paneEl) return;
      const totalWidth = paneEl.getBoundingClientRect().width;
      const delta = ((ev.clientX - startX) / totalWidth) * 100;
      setPreviewSplitPercent(Math.min(80, Math.max(20, startPercent - delta)));
    };

    const onMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setIsResizingPreview(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      localStorage.setItem(PREVIEW_SPLIT_KEY, String(previewSplitRef.current));
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const previewIsOpen = openTabs.some((t) => t.id === "preview");
  const showSplitView = previewIsOpen && openTabs.some((t) => t.id !== "preview");
  const editorDisplayTab = activeTab?.id === "preview" ? lastNonPreviewTabRef.current : activeTab;

  const activeFile =
    editorDisplayTab &&
    !["controls", "settings", "variables", "import", "export", "readme", "preview"].includes(editorDisplayTab.id)
      ? (EDITOR_FILES.find((f) => f.id === editorDisplayTab.id) ?? null)
      : null;

  const handleWidgetNameChange = (v: string) => {
    if (v.length > 0 && widgetError === "name cannot be empty") setWidgetError(null);
    set({ widgetName: v });
  };

  const handleMinimizeWindow = () => {
    electronAPI?.minimizeWindow?.();
  };

  const handleCloseWindow = () => {
    electronAPI?.closeWindow?.();
  };

  return (
    <Root>
      <TitleBar className="drag">
        <TitleLeft>
          <Code2 size={14} className="text-text-muted shrink-0" />
          <TitleLabel>pogly widget editor</TitleLabel>
        </TitleLeft>

        <TitleRight className="no-drag">
          <Button id="minimize" className="w-fit! h-fit! p-1!" onClick={handleMinimizeWindow}>
            <Minimize size={15} />
          </Button>

          <Button id="close" className="w-fit! h-fit! p-1!" onClick={handleCloseWindow}>
            <X size={15} />
          </Button>
        </TitleRight>
      </TitleBar>

      <BodyRow>
        <WidgetSidebar activeTab={activeTab} openTab={openTab} files={EDITOR_FILES} />

        <EditorArea>
          {openTabs.length > 0 && (
            <WidgetTabs
              tabStripRef={tabStripRef}
              openTabs={openTabs}
              activeTab={activeTab}
              editorFiles={EDITOR_FILES}
              setActiveTab={setActiveTab}
              closeTab={closeTab}
            />
          )}

          <EditorPane ref={editorPaneRef} style={showSplitView ? { display: "flex", flexDirection: "row" } : undefined}>
            <div
              style={
                showSplitView
                  ? {
                      width: `${100 - previewSplitPercent}%`,
                      minWidth: 200,
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }
                  : { display: "contents" }
              }
            >
              {(editorDisplayTab === null || openTabs.filter((t) => t.id !== "preview").length === 0) &&
                !showSplitView && (
                  <EmptyState>
                    <Code2 size={32} className="text-border mb-2" />
                    <span className="text-text-muted text-[13px] select-none">open a file from the explorer</span>
                  </EmptyState>
                )}

              {editorDisplayTab?.id === "controls" && (
                <WidgetControlsView
                  variables={value.variables}
                  setVariables={setVariables}
                  widgetName={value.widgetName}
                  setWidgetName={handleWidgetNameChange}
                  widgetWidth={value.widgetWidth}
                  setWidgetWidth={(v) => set({ widgetWidth: v })}
                  widgetHeight={value.widgetHeight}
                  setWidgetHeight={(v) => set({ widgetHeight: v })}
                />
              )}

              {editorDisplayTab?.id === "variables" && (
                <div className="p-5 h-full overflow-y-scroll">
                  <WidgetInfo />
                  <WidgetVariableTable
                    variables={value.variables}
                    setVariables={setVariables}
                    setError={setWidgetError}
                    readOnly={false}
                  />
                </div>
              )}

              {editorDisplayTab?.id === "export" && (
                <div className="p-5 h-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-text-muted">Widget JSON (read-only)</span>
                    <button
                      onClick={handleCopyExport}
                      className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-text-secondary px-2 py-1 rounded hover:bg-surface-hover"
                    >
                      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                      {copied ? "copied" : "copy"}
                    </button>
                  </div>
                  <ExportTextarea rows={10} readOnly value={exportString} />
                </div>
              )}

              {editorDisplayTab?.id === "import" && (
                <div className="p-5 h-full flex flex-col gap-3">
                  <span className="text-[12px] text-text-muted">Paste widget JSON below</span>
                  <ExportTextarea
                    rows={10}
                    value={importCode}
                    placeholder="Paste widget string here"
                    onChange={(e) => {
                      setImportError("");
                      setImportCode(e.target.value);
                    }}
                  />
                  {importError && (
                    <span className="text-[12px]" style={{ color: "var(--color-danger)" }}>
                      {importError}
                    </span>
                  )}
                  <div>
                    <Button onClick={handleImport}>Load widget</Button>
                  </div>
                </div>
              )}

              {editorDisplayTab?.id === "settings" && (
                <div className="p-6 overflow-auto h-full">
                  <SettingsCard>
                    <SettingsLabel>save location</SettingsLabel>
                    <SettingsDescription>
                      New saves and Save As dialogs will open in this folder. Existing files keep saving to their
                      current path.
                    </SettingsDescription>
                    <SettingsPath>{saveDirectory ?? "No folder selected yet."}</SettingsPath>
                    <SettingsActions>
                      <Button onClick={onChooseSaveDirectory}>choose folder</Button>
                      <Button disabled={!saveDirectory} onClick={onClearSaveDirectory}>
                        reset
                      </Button>
                    </SettingsActions>
                  </SettingsCard>
                </div>
              )}

              {editorDisplayTab?.id === "readme" && <WidgetReadme />}

              {activeFile && (
                <WidgetCodeEditor
                  language={activeFile.monacoLanguage}
                  path={`widget://${activeFile.filename}`}
                  value={
                    activeFile.id === "header"
                      ? value.headerTag
                      : activeFile.id === "body"
                        ? value.bodyTag
                        : activeFile.id === "style"
                          ? value.styleTag
                          : value.scriptTag
                  }
                  onChange={(code) => {
                    if (activeFile.id === "script") setShowWarning(code.includes("while"));
                    const key =
                      activeFile.id === "header"
                        ? "headerTag"
                        : activeFile.id === "body"
                          ? "bodyTag"
                          : activeFile.id === "style"
                            ? "styleTag"
                            : "scriptTag";
                    set({ [key]: code });
                  }}
                  variables={value.variables}
                />
              )}
            </div>

            {showSplitView && (
              <>
                <PreviewSplitHandle onMouseDown={handlePreviewSplitMouseDown} title="Drag to resize" />
                <div
                  style={{ width: `${previewSplitPercent}%`, minWidth: 150, overflow: "hidden", position: "relative" }}
                >
                  <WidgetPreview widget={value} />
                  {isResizingPreview && <div style={{ position: "absolute", inset: 0, zIndex: 10 }} />}
                </div>
              </>
            )}

            {previewIsOpen && !showSplitView && <WidgetPreview widget={value} />}
          </EditorPane>
        </EditorArea>
      </BodyRow>

      <WidgetFooter
        widgetError={widgetError}
        isDirty={isDirty}
        showWarning={showWarning}
        disableCreate={value.widgetName.length < 1}
        onSave={onSave}
        onNew={onNew}
        onOpen={onOpen}
      />
    </Root>
  );
};

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: var(--color-body);
  overflow: hidden;
`;

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 42px;
  padding: 0 10px 0 14px;
  background: var(--color-body);
  border-bottom: 1px solid var(--color-border-dark);
  flex-shrink: 0;
  border-radius: 12px;
`;

const TitleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
`;

const TitleRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const TitleLabel = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
  user-select: none;
  white-space: nowrap;
`;

const BodyRow = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  max-width: 100%;
`;

const EditorArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const EditorPane = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  background: var(--color-surface);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const SettingsCard = styled.div`
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 14px 18px;
`;

const SettingsLabel = styled.div`
  font-size: 14px;
  color: var(--color-text-muted);
`;

const SettingsDescription = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-text-muted);
`;

const SettingsPath = styled.code`
  display: block;
  padding: 12px;
  border-radius: 6px;
  background: var(--color-input);
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const SettingsActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
`;

const PreviewSplitHandle = styled.div`
  width: 4px;
  flex-shrink: 0;
  cursor: col-resize;
  background: var(--color-border-dark);
  transition: background 0.15s;

  &:hover,
  &:active {
    background: var(--color-accent);
  }
`;

const ExportTextarea = styled.textarea`
  width: 100%;
  background: var(--color-body);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px;
  font-family: "Fira code", "Fira Mono", monospace;
  font-size: 12px;
  resize: vertical;
  box-sizing: border-box;

  &::placeholder {
    color: var(--color-text-muted);
  }
  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
`;
