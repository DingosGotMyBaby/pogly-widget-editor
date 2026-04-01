import { Check } from "lucide-react";
import { useId } from "react";

interface IProps {
  checked?: boolean;
  onChange: (next: any) => void;
  onChangeEvent?: boolean;
  disabled?: boolean;
  checkboxClassName?: string;
}

export const Checkbox = ({ checked, onChange, onChangeEvent, disabled, checkboxClassName }: IProps) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-2 w-fit">
      <label
        htmlFor={id}
        className={`inline-flex items-center gap-2 select-none ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => (onChangeEvent ? onChange(e) : onChange(e.target.checked))}
        />
        <span
          className={
            "grid place-items-center h-5 w-5 rounded-md bg-input border border-border shadow-sm transition peer-checked:border-accent peer-checked:bg-accent/10 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40" +
            (checkboxClassName ? ` ${checkboxClassName}` : "")
          }
        >
          {checked && <Check size={14} className="text-accent" />}
        </span>
      </label>
    </div>
  );
};
