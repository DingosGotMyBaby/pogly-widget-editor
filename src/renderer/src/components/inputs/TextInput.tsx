import { ChangeEventHandler } from "react";

interface IProps {
  placeholder: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  inputRef?: any;
  value?: string | number;
  title?: string;
  disabled?: boolean;
  inputClassName?: string;
  containerClassName?: string;
}

export const TextInput = ({
  placeholder,
  onChange,
  inputRef,
  value,
  title,
  disabled,
  inputClassName,
  containerClassName,
}: IProps) => (
  <div className={containerClassName}>
    {title && <p className="text-sm text-text-muted">{title}</p>}
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={value ?? ""}
      className={
        "bg-input text-text-secondary p-3 rounded-md placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-border disabled:cursor-not-allowed disabled:opacity-80 " +
        (inputClassName ?? "")
      }
      onChange={onChange}
      disabled={disabled}
    />
  </div>
);
