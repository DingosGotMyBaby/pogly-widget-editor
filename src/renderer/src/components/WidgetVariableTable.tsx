import { ChangeEvent, useRef, useState } from "react";
import styled from "styled-components";
import { VariableValueType, WidgetVariableType } from "../types/WidgetData";
import { HexColorPicker } from "react-colorful";
import { Table } from "./general/Table";
import { TableCell } from "./general/TableCell";
import { TableRow } from "./general/TableRow";
import { ChevronDown, LayoutDashboard, Plus } from "lucide-react";
import { Button } from "./inputs/Button";
import { TextInput } from "./inputs/TextInput";
import { Select } from "./inputs/Select";
import { Checkbox } from "./inputs/Checkbox";

interface IProps {
  variables: WidgetVariableType[];
  setVariables: (v: WidgetVariableType[] | ((prev: WidgetVariableType[]) => WidgetVariableType[])) => void;
  setError: (msg: string | null) => void;
  readOnly: boolean;
}

export const WidgetVariableTable = ({ variables, setVariables, setError, readOnly }: IProps) => {
  const [showPickers, setShowPickers] = useState<{ [key: number]: boolean }>({});
  const colorInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const [variableRow, setVariableRow] = useState<number | null>(null);

  const updateRow = (index: number, updates: Partial<WidgetVariableType>) => {
    setVariables((prev: WidgetVariableType[]) => prev.map((row, i) => (i === index ? { ...row, ...updates } : row)));
  };

  const handleNameChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (["is_overlay", "widget_width", "widget_height"].includes(value)) {
      setError("Cannot override system variable names.");
    } else {
      setError(null);
    }
    updateRow(index, { variableName: value });
  };

  const handleTypeChange = (index: number, e: ChangeEvent<HTMLSelectElement>) => {
    const variableType = parseInt(e.target.value) as VariableValueType;
    updateRow(index, {
      variableType,
      variableValue:
        variableType === VariableValueType.boolean || variableType === VariableValueType.toggle ? (false as any) : "",
    });
  };

  const handleValueChange = (index: number, valueOrEvent: any) => {
    if (typeof valueOrEvent === "object" && "target" in valueOrEvent) {
      const target = valueOrEvent.target;
      if (target instanceof HTMLInputElement && target.type === "checkbox") {
        updateRow(index, { variableValue: target.checked as any });
        return;
      }
      updateRow(index, { variableValue: target.value });
      return;
    }
    updateRow(index, { variableValue: valueOrEvent });
  };

  const handleColorChange = (index: number, color: string) => {
    updateRow(index, { variableValue: color });
    if (colorInputRefs.current[index]) colorInputRefs.current[index]!.value = color;
  };

  const addRow = () => {
    setVariables((prev: WidgetVariableType[]) => [
      ...prev,
      { variableName: "", variableType: VariableValueType.string, variableValue: "" },
    ]);
  };

  const deleteRow = (index: number) => {
    setVariables((prev: WidgetVariableType[]) => prev.filter((_, i) => i !== index));
  };

  const moveRow = (index: number, direction: "up" | "down") => {
    setVariables((prev: WidgetVariableType[]) => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  if (variables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 relative top-1/5">
        <LayoutDashboard size={34} className="text-border mb-1" />
        <p className="text-text-muted text-[13px]">no variables defined</p>
        {!readOnly && <Button onClick={addRow}>New variable</Button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <Table headers={!readOnly ? ["Name", "Type", "Value", "Actions"] : ["Name", "Value"]} alignLastLeft={readOnly}>
        {variables.map((row, index) => (
          <TableRow key={index} noHoverEffect={true}>
            <TableCell>
              <TextInput
                placeholder="name"
                value={row.variableName}
                disabled={readOnly}
                onChange={(e) => handleNameChange(index, e)}
              />
            </TableCell>

            {!readOnly && (
              <TableCell>
                <Select value={row.variableType} onChange={(e) => handleTypeChange(index, e)}>
                  <option value={VariableValueType.string}>String</option>
                  <option value={VariableValueType.boolean}>Boolean</option>
                  <option value={VariableValueType.toggle}>Toggle</option>
                  <option value={VariableValueType.color}>Color</option>
                  <option value={VariableValueType.image}>Image</option>
                </Select>
              </TableCell>
            )}

            <TableCell>
              {row.variableType === VariableValueType.string && (
                <TextInput
                  placeholder="value"
                  value={row.variableValue as string}
                  onChange={(e) => handleValueChange(index, e)}
                />
              )}

              {(row.variableType === VariableValueType.boolean || row.variableType === VariableValueType.toggle) && (
                <Checkbox
                  checked={(row.variableValue as any) || false}
                  onChange={(e) => handleValueChange(index, e)}
                  onChangeEvent={true}
                  checkboxClassName="w-8 h-8"
                />
              )}

              {row.variableType === VariableValueType.color && (
                <div style={{ display: "flex" }}>
                  <ColorBox
                    onClick={() => setShowPickers((p) => ({ ...p, [index]: !p[index] }))}
                    style={{ backgroundColor: row.variableValue as string, marginRight: "10px" }}
                  />
                  <TextInput
                    inputRef={(el: any) => (colorInputRefs.current[index] = el)}
                    placeholder="color"
                    value={row.variableValue as string}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                  />
                  {showPickers[index] && (
                    <Popover>
                      <Cover onClick={() => setShowPickers((p) => ({ ...p, [index]: false }))} />
                      <HexColorPicker
                        color={row.variableValue as string}
                        onChange={(color) => handleColorChange(index, color)}
                      />
                    </Popover>
                  )}
                </div>
              )}

              {row.variableType === VariableValueType.image && (
                <TextInput
                  placeholder="paste image URL or data URI"
                  value={row.variableValue as string}
                  onChange={(e) => updateRow(index, { variableValue: e.target.value })}
                />
              )}
            </TableCell>

            {!readOnly && (
              <TableCell className="flex justify-end content-center">
                <div
                  className="flex mt-2 justify-center content-center flex-wrap py-3 w-12.5 text-gray-300 bg-surface-hover rounded-xl h-2.5"
                  onMouseLeave={() => setVariableRow(null)}
                >
                  <div
                    className="flex w-full h-2.5 justify-center items-center bg-surface-hover rounded-xl cursor-pointer"
                    onClick={() => setVariableRow(index)}
                  >
                    <ChevronDown size={14} className="text-text-muted" />
                  </div>

                  {variableRow === index && (
                    <div
                      className="absolute z-999 mt-2 right-0 bg-body border border-gray-700 rounded-md shadow-lg -translate-x-9"
                      onMouseLeave={() => setVariableRow(null)}
                    >
                      <ul className="text-gray-300 text-xs">
                        <li
                          className="px-3 py-2 hover:bg-surface-hover cursor-pointer"
                          onClick={() => {
                            setVariableRow(null);
                            moveRow(index, "up");
                          }}
                        >
                          move up
                        </li>
                        <li
                          className="px-3 py-2 hover:bg-surface-hover cursor-pointer"
                          onClick={() => {
                            setVariableRow(null);
                            moveRow(index, "down");
                          }}
                        >
                          move down
                        </li>
                        <li
                          className="px-3 py-2 hover:bg-surface-hover cursor-pointer"
                          onClick={() => {
                            setVariableRow(null);
                            deleteRow(index);
                          }}
                        >
                          delete
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </Table>

      {!readOnly && (
        <Button className="flex items-center gap-2 w-fit self-center" onClick={addRow}>
          <Plus size={18} /> New variable
        </Button>
      )}
    </div>
  );
};

export const WidgetInfo = () => (
  <div className="mb-4 p-3 rounded-md bg-body border border-border text-[12px] text-text-muted leading-relaxed">
    <p className="text-[#82a5ff] font-semibold mb-1">What are variables?</p>
    <p className="mb-2">
      Variables let you expose configurable values in your widget without editing code. Each variable gets a name and a
      default value.
    </p>
    <p className="text-[#82a5ff] font-semibold mb-1">How to use them</p>
    <p>
      Reference a variable in your HTML, CSS, or JS using {"{variable_name}"}. It will be substituted with the
      variable's current value at render time.
    </p>
  </div>
);

const ColorBox = styled.div`
  width: 40px;
  height: 40px;
  border: 2px solid #fff;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
`;

const Popover = styled.div`
  position: absolute;
  z-index: 2;
`;

const Cover = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;
