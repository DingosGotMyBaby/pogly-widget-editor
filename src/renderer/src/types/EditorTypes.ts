export type TabId = {
  id: string;
  color: string;
  label: string;
};

export const TAB_CONTROLS: TabId = { id: "controls", color: "#4ade80", label: "controls" };
export const TAB_SETTINGS: TabId = { id: "settings", color: "#f59e0b", label: "settings" };
export const TAB_VARIABLES: TabId = { id: "variables", color: "#a78bfa", label: "variables" };
export const TAB_IMPORT: TabId = { id: "import", color: "#f472b6", label: "import.json" };
export const TAB_EXPORT: TabId = { id: "export", color: "#34d399", label: "export.json" };
export const TAB_README: TabId = { id: "readme", color: "#94a3b8", label: "readme.md" };
export const TAB_PREVIEW: TabId = { id: "preview", color: "#22d3ee", label: "preview" };
