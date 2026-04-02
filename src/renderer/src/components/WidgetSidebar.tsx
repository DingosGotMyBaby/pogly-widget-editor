import { BookOpen, Info, LayoutDashboard, MonitorPlay, Settings, SlidersHorizontal } from "lucide-react";
import styled from "styled-components";
import { TabId, TAB_CONTROLS, TAB_EXPORT, TAB_IMPORT, TAB_PREVIEW, TAB_README, TAB_SETTINGS, TAB_VARIABLES } from "../types/EditorTypes";
import { HoverTooltip } from "./general/HoverTooltip";

interface IProps {
  activeTab: TabId | null;
  openTab: (id: TabId) => void;
  files: any[];
}

const WidgetSidebar = ({ activeTab, openTab, files }: IProps) => (
  <Sidebar>
    <SidebarGroupLabel>Usage</SidebarGroupLabel>

    <SidebarRow $active={activeTab?.id === "controls"} onClick={() => openTab(TAB_CONTROLS)}>
      <LayoutDashboard size={12} style={{ color: TAB_CONTROLS.color, flexShrink: 0 }} />
      <TabText>controls</TabText>
    </SidebarRow>

    <SidebarRow $active={activeTab?.id === "preview"} onClick={() => openTab(TAB_PREVIEW)}>
      <MonitorPlay
        size={12}
        style={{ color: TAB_PREVIEW.color, alignSelf: "center", display: "flex", justifySelf: "center" }}
      />
      <TabText>preview</TabText>
    </SidebarRow>

    <SidebarDivider />

    <SidebarGroupLabel>Explorer</SidebarGroupLabel>

    {files.map((file: any) => (
      <SidebarRow key={file.id} $active={activeTab?.id === file.id} onClick={() => openTab(file)}>
        <Dot style={{ background: file.color }} />
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

    <SidebarRow $active={activeTab?.id === "variables"} onClick={() => openTab(TAB_VARIABLES)}>
      <SlidersHorizontal size={12} style={{ color: TAB_VARIABLES.color, flexShrink: 0 }} />
      <TabText>variables</TabText>
    </SidebarRow>

    <SidebarDivider />

    <SidebarGroupLabel>Actions</SidebarGroupLabel>

    <SidebarRow $active={activeTab?.id === "import"} onClick={() => openTab(TAB_IMPORT)}>
      <Dot style={{ background: TAB_IMPORT.color }} />
      <TabText>import</TabText>
    </SidebarRow>

    <SidebarRow $active={activeTab?.id === "export"} onClick={() => openTab(TAB_EXPORT)}>
      <Dot style={{ background: TAB_EXPORT.color }} />
      <TabText>export</TabText>
    </SidebarRow>

    <SidebarDivider />

    <SidebarGroupLabel>Preferences</SidebarGroupLabel>

    <SidebarRow $active={activeTab?.id === "settings"} onClick={() => openTab(TAB_SETTINGS)}>
      <Settings size={12} style={{ color: TAB_SETTINGS.color, flexShrink: 0 }} />
      <TabText>settings</TabText>
    </SidebarRow>

    <SidebarDivider />

    <SidebarGroupLabel>Help</SidebarGroupLabel>

    <SidebarRow $active={activeTab?.id === "readme"} onClick={() => openTab(TAB_README)}>
      <BookOpen size={12} style={{ color: TAB_README.color, flexShrink: 0 }} />
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
