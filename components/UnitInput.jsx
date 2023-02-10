import styles from "styles/components/UnitInput.module.scss";
import { useCallback, useEffect, useState } from "react";
import { usePrevious } from "lib/hooks";

export default function UnitInput({
  unit,
  className,
  value,
  charBlacklist,
  ...extraProps
}) {
  const [typingValue, setTypingValue] = useState(value ?? "");

  useEffect(() => {
    if (value) {
      setTypingValue(value);
    }
  }, [value]);

  const previousValue = usePrevious(value);
  const onBlur = useCallback(
    e => {
      const value = e.target.value ?? "";
      if (value !== previousValue) {
        extraProps.onChange?.(value);
      }
    },
    [previousValue, extraProps]
  );

  const onChange = useCallback(e => {
    setTypingValue(e.target.value);
  }, []);

  const onKeyDown = useCallback(
    e => {
      if (charBlacklist?.includes(e.key)) {
        e.preventDefault();
      }
    },
    [charBlacklist]
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
