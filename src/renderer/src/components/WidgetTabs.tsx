import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import styled from "styled-components";
import { TabId } from "../types/EditorTypes";

const VARIABLES_DOT_COLOR = "#a78bfa";
const CONTROLS_DOT_COLOR = "#4ade80";
const README_DOT_COLOR = "#94a3b8";
const SETTINGS_DOT_COLOR = "#f59e0b";

interface IProps {
  tabStripRef: any;
  openTabs: TabId[];
  activeTab: TabId | null;
  editorFiles: any[];
  setActiveTab: Dispatch<SetStateAction<TabId>>;
  closeTab: (id: TabId, e: React.MouseEvent) => void;
}

const WidgetTabs = ({ tabStripRef, openTabs, activeTab, editorFiles, setActiveTab, closeTab }: IProps) => (
  <TabStrip ref={tabStripRef}>
    {openTabs.map((tabId) => {
      const file = editorFiles.find((f: any) => f.id === tabId);
      const isActive = activeTab === tabId;

      const dotColor =
        tabId === "controls"
          ? CONTROLS_DOT_COLOR
          : tabId === "settings"
            ? SETTINGS_DOT_COLOR
            : tabId === "variables"
              ? VARIABLES_DOT_COLOR
              : tabId === "export"
                ? "#34d399"
                : tabId === "import"
                  ? "#f472b6"
                  : tabId === "readme"
                    ? README_DOT_COLOR
                    : tabId === "preview"
                      ? "#22d3ee"
                      : (file?.dotColor ?? "var(--color-text-muted)");

      const label =
        tabId === "controls"
          ? "controls"
          : tabId === "settings"
            ? "settings"
            : tabId === "variables"
              ? "variables"
              : tabId === "export"
                ? "export.json"
                : tabId === "import"
                  ? "import.json"
                  : tabId === "readme"
                    ? "readme.md"
                    : tabId === "preview"
                      ? "preview"
                      : (file?.filename ?? tabId);

      return (
        <Tab
          key={tabId}
          data-tab={tabId}
          $active={isActive}
          onClick={() => setActiveTab(tabId)}
          onMouseDown={(e) => {
            if (e.buttons !== 4) return;
            closeTab(tabId, e);
          }}
        >
          <Dot style={{ background: dotColor, width: 7, height: 7 }} />
          <span>{label}</span>
          <TabCloseBtn onClick={(e) => closeTab(tabId, e)} title="close tab">
            <X size={10} fill="#edf1ff" />
          </TabCloseBtn>
        </Tab>
      );
    })}
  </TabStrip>
);

const TabStrip = styled.div`
  display: flex;
  align-items: stretch;
  height: 35px;
  background: var(--color-body);
  border-bottom: 1px solid var(--color-border-dark);
  flex-shrink: 0;
  overflow-x: auto;
  width: 100%;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: none;
  border-right: 1px solid var(--color-border-dark);
  border-top: 2px solid ${(p) => (p.$active ? "var(--color-accent)" : "transparent")};
  background: ${(p) => (p.$active ? "var(--color-base)" : "transparent")};
  color: ${(p) => (p.$active ? "var(--color-text-secondary)" : "var(--color-text-muted)")};
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-secondary);
  }
`;

const TabCloseBtn = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  border-radius: 3px;
  margin-left: 2px;

  &:hover {
    background: var(--color-surface);
    color: var(--color-text-secondary);
  }
  & > svg {
    width: 15px;
    height: 15px;
  }
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export default WidgetTabs;
