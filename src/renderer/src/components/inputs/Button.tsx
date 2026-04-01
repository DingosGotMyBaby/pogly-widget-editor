import { MouseEventHandler, PropsWithChildren } from "react";
import styled from "styled-components";

interface IProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
  style?: object;
  id?: string;
}

export const Button = ({ onClick, disabled, className, style, id, children }: PropsWithChildren<IProps>) => (
  <StyledButton id={id} className={className} disabled={disabled} style={style} onClick={onClick}>
    {children}
  </StyledButton>
);

const StyledButton = styled.button`
  background-color: var(--color-input);
  color: var(--color-text-primary);
  padding: 8px 15px 10px 15px;
  border-radius: 7px;
  border: solid 1px transparent;
  user-select: none;
  cursor: pointer;

  &:hover {
    background-color: var(--color-accent-hover);
    border-color: var(--color-accent-border);
  }

  &:disabled {
    background-color: var(--color-input-hover);
    color: var(--color-text-disabled);
    border-color: transparent;
    cursor: not-allowed;
  }
`;
