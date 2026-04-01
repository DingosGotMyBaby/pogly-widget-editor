import styled from "styled-components";
import { Button } from "./inputs/Button";
import { TriangleAlert } from "lucide-react";

interface IProps {
  widgetError: string | null;
  isDirty: boolean;
  showWarning: boolean;
  disableCreate: boolean;
  onSave: () => void;
  onNew: () => void;
  onOpen: () => void;
}

const WidgetFooter = ({ widgetError, isDirty, showWarning, disableCreate, onSave, onNew, onOpen }: IProps) => (
  <Footer>
    <WarningsContainer>
      {widgetError && (
        <StatusMsg $type="error">
          <TriangleAlert size={13} className="shrink-0" />
          <span>{widgetError}</span>
        </StatusMsg>
      )}
      {isDirty && !widgetError && (
        <StatusMsg $type="warning">
          <TriangleAlert size={13} className="shrink-0" />
          <span>unsaved changes &middot; Ctrl+S to save</span>
        </StatusMsg>
      )}
      {showWarning && !widgetError && (
        <StatusMsg $type="warning">
          <TriangleAlert size={13} className="shrink-0" />
          <span>while loop detected, make sure it isn't infinite!</span>
        </StatusMsg>
      )}
    </WarningsContainer>

    <ButtonContainer>
      <Button onClick={onNew}>new</Button>
      <Button onClick={onOpen}>open</Button>
      <Button disabled={!!widgetError || disableCreate} onClick={onSave}>
        save
      </Button>
    </ButtonContainer>
  </Footer>
);

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 48px;
  padding: 0 12px;
  background: var(--color-body);
  border-top: 1px solid var(--color-border-dark);
  flex-shrink: 0;
`;

const WarningsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const StatusMsg = styled.div<{ $type: "warning" | "error" }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${(p) => (p.$type === "error" ? "var(--color-danger)" : "var(--color-warning)")};
  min-width: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-right: 10px;
`;

export default WidgetFooter;
