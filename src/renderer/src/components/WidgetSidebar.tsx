import { BookOpen, Info, LayoutDashboard, MonitorPlay, Settings, SlidersHorizontal } from "lucide-react";
import styled from "styled-components";
import { TabId } from "../types/EditorTypes";
import { HoverTooltip } from "./general/HoverTooltip";

const VARIABLES_DOT_COLOR = "#a78bfa";
const CONTROLS_DOT_COLOR = "#4ade80";
const README_DOT_COLOR = "#94a3b8";
const SETTINGS_DOT_COLOR = "#f59e0b";

interface IProps {
  activeTab: TabId | null;
  openTab: (id: TabId) => void;
  files: any[];
}

const WidgetSidebar = ({ activeTab, openTab, files }: IProps) => (
  <Sidebar>
    <SidebarGroupLabel>Usage</SidebarGroupLabel>

    <SidebarRow $active={activeTab === "controls"} onClick={() => openTab("controls")}>
      <LayoutDashboard size={12} style={{ color: CONTROLS_DOT_COLOR, flexShrink: 0 }} />
      <TabText>controls</TabText>
    </SidebarRow>

    <SidebarRow $active={activeTab === "preview"} onClick={() => openTab("preview")}>
      <MonitorPlay
        size={12}
        style={{ color: "#22d3ee", alignSelf: "center", display: "flex", justifySelf: "center" }}
      />
      <TabText>preview</TabText>
    </SidebarRow>

    <SidebarDivider />

    <SidebarGroupLabel>Explorer</SidebarGroupLabel>

    {files.map((file: any) => (
      <SidebarRow key={file.id} $active={activeTab === file.id} onClick={() => openTab(file.id)}>
        <Dot style={{ background: file.dotColor }} />
        <TabText>{file.filename}</TabText>
      </SidebarRow>
    ))}

    <SidebarDivider />

    <SidebarGroupLabel>
      Variables
      <HoverTooltip
        content={
          <div className="space-y-1 text-[12px]" style={{ whiteSpace: "normal", maxWidth: "210px" }}>
            <div className="font-semibold mb-1">system variables</div>
            <div>
              <strong>{"{is_overlay}"}</strong> — always false in standalone editor
            </div>
            <div>
              <strong>{"{widget_width}"}</strong> — widget width
            </div>
            <div>
              <strong>{"{widget_height}"}</strong> — widget height
            </div>
          </div>
        }
      >
        <Info size={12} className="text-text-muted cursor-help ml-0.5 shrink-0" />
      </HoverTooltip>
    </SidebarGroupLabel>

    <SidebarRow $active={activeTab === "variables"} onClick={() => openTab("variables")}>
      <SlidersHorizontal size={12} style={{ color: VARIABLES_DOT_COLOR, flexShrink: 0 }} />
      <TabText>variables</TabText>
    </SidebarRow>

    <SidebarDivider />

    <SidebarGroupLabel>Actions</SidebarGroupLabel>

    <SidebarRow $active={activeTab === "import"} onClick={() => openTab("import")}>
      <Dot style={{ background: "#f472b6" }} />
      <TabText>import</TabText>
    </SidebarRow>

    <SidebarRow $active={activeTab === "export"} onClick={() => openTab("export")}>
      <Dot style={{ background: "#34d399" }} />
      <TabText>export</TabText>
    </SidebarRow>

    <SidebarDivider />

    <SidebarGroupLabel>Preferences</SidebarGroupLabel>

    <SidebarRow $active={activeTab === "settings"} onClick={() => openTab("settings")}>
      <Settings size={12} style={{ color: SETTINGS_DOT_COLOR, flexShrink: 0 }} />
      <TabText>settings</TabText>
    </SidebarRow>

    <SidebarDivider />

    <SidebarGroupLabel>Help</SidebarGroupLabel>

    <SidebarRow $active={activeTab === "readme"} onClick={() => openTab("readme")}>
      <BookOpen size={12} style={{ color: README_DOT_COLOR, flexShrink: 0 }} />
      <TabText>readme</TabText>
    </SidebarRow>
  </Sidebar>
);

const Sidebar = styled.nav`
  width: 172px;
  flex-shrink: 0;
  background: var(--color-body);
  border-right: 1px solid var(--color-border-dark);
  display: flex;
  flex-direction: column;
  padding: 8px 0 12px;
  max-width: 100%;
`;

const SidebarGroupLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 12px 5px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  user-select: none;
`;

const SidebarRow = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 5px 12px 5px 14px;
  border: none;
  border-left: 2px solid ${(p) => (p.$active ? "var(--color-accent)" : "transparent")};
  background: ${(p) => (p.$active ? "var(--color-accent-hover)" : "transparent")};
  color: ${(p) => (p.$active ? "var(--color-text-secondary)" : "var(--color-text-muted)")};
  font-size: 13px;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-secondary);
  }
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const SidebarDivider = styled.div`
  height: 1px;
  background: var(--color-border-dark);
  margin: 8px 0;
`;

const TabText = styled.span`
  font-size: 14px;
`;

export default WidgetSidebar;
