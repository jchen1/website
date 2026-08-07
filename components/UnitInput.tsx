import styles from "styles/components/UnitInput.module.scss";
import { useCallback, useEffect, useState } from "react";
import { usePrevious } from "lib/hooks";

import type { ComponentProps } from "react";

export interface UnitInputProps extends Omit<
  ComponentProps<"input">,
  "onChange" | "value" | "className"
> {
  /** suffix rendered next to the field, e.g. "s" or "pts" */
  unit?: string;
  className?: string;
  value?: string | number;
  /** keystrokes swallowed before they reach the field */
  charBlacklist?: string[];
  /** fires on blur with the committed value, not on every keystroke */
  onChange?: (value: string) => void;
}

export default function UnitInput({
  unit,
  className,
  value,
  charBlacklist,
  ...extraProps
}: UnitInputProps) {
  const [typingValue, setTypingValue] = useState(value ?? "");

  useEffect(() => {
    if (value) {
      setTypingValue(value);
    }
  }, [value]);

  const previousValue = usePrevious(value);
  const onBlur = useCallback(
    (e: FocusEvent) => {
      const value = (e.target as HTMLInputElement).value ?? "";
      if (value !== previousValue) {
        extraProps.onChange?.(value);
      }
    },
    [previousValue, extraProps],
  );

  const onChange = useCallback((e: Event) => {
    setTypingValue((e.target as HTMLInputElement).value);
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (charBlacklist?.includes(e.key)) {
        e.preventDefault();
      }
    },
    [charBlacklist],
  );

  return (
    <div className={`${styles.container} ${className}`}>
      <input
        {...extraProps}
        className={styles.input}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onChange={onChange}
        value={typingValue}
      ></input>
      {unit && <span className={styles.unit}>{unit}</span>}
    </div>
  );
}
