import styled from "styled-components";
import { LayoutDashboard } from "lucide-react";
import { WidgetVariableType } from "../types/WidgetData";
import { TextInput } from "./inputs/TextInput";
import { WidgetVariableTable } from "./WidgetVariableTable";

interface IProps {
  variables: WidgetVariableType[];
  setVariables: (v: WidgetVariableType[]) => void;
  widgetName: string;
  setWidgetName: (v: string) => void;
  widgetWidth: number;
  setWidgetWidth: (v: number) => void;
  widgetHeight: number;
  setWidgetHeight: (v: number) => void;
}

export const WidgetControlsView = ({
  variables,
  setVariables,
  widgetName,
  setWidgetName,
  widgetWidth,
  setWidgetWidth,
  widgetHeight,
  setWidgetHeight,
}: IProps) => (
  <div className="p-6 overflow-auto h-full">
    <div className="space-y-3 mb-5">
      <ControlRow $inline={true}>
        <TextInput
          containerClassName="w-full"
          title="name"
          placeholder="widget name..."
          value={widgetName}
          onChange={(e) => setWidgetName(e.target.value)}
        />
        <div className="flex gap-3">
          <TextInput
            containerClassName="w-fit"
            title="width"
            placeholder="width..."
            value={widgetWidth}
            onChange={(e) => setWidgetWidth(parseInt(e.target.value) || 0)}
          />
          <TextInput
            containerClassName="w-fit"
            title="height"
            placeholder="height..."
            value={widgetHeight}
            onChange={(e) => setWidgetHeight(parseInt(e.target.value) || 0)}
          />
        </div>
      </ControlRow>
    </div>

    {variables.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-2 select-none py-10">
        <LayoutDashboard size={34} className="text-border mb-1" />
        <p className="text-text-muted text-[13px]">no variables defined</p>
        <p className="text-[12px]" style={{ color: "var(--color-text-disabled)" }}>
          this widget has no configurable variables
        </p>
      </div>
    ) : (
      <ControlRow $inline={true}>
        <WidgetVariableTable variables={variables} setVariables={setVariables} setError={() => {}} readOnly={true} />
      </ControlRow>
    )}
  </div>
);

const ControlRow = styled.div<{ $inline: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 14px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  flex-direction: ${(p) => (p.$inline ? "row" : "column")};
  align-items: ${(p) => (p.$inline ? "center" : "stretch")};
`;
