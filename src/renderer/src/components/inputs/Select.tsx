import styled from "styled-components";
import { ChevronDown } from "lucide-react";
import { ChangeEventHandler, PropsWithChildren } from "react";

interface IProps {
  value?: string | number;
  disabled?: boolean;
  className?: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
}

export const Select = ({ value, disabled, className, onChange, children }: PropsWithChildren<IProps>) => (
  <div className={className ? "relative " + className : "relative"}>
    <div className="flex">
      <StyledSelect value={value} onChange={onChange} disabled={disabled}>
        {children}
      </StyledSelect>
      <ChevronDown className="pointer-events-none absolute self-center text-gray-400 right-0 mr-3" />
    </div>
  </div>
);

const StyledSelect = styled.select`
  width: 100%;
  appearance: none;
  background-color: var(--color-input);
  color: var(--color-text-secondary);
  padding: 10px;
  border-radius: 7px;
  user-select: none;
  cursor: pointer;
  border: none;

  &:focus {
    outline: none;
  }
  &:hover {
    background-color: var(--color-input-hover);
  }
  & > option {
    background-color: var(--color-input);
  }
  &:disabled {
    background-color: var(--color-input-hover);
    color: var(--color-text-disabled);
    cursor: not-allowed;
  }
`;
