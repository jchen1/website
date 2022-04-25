import styles from "styles/components/UnitInput.module.scss";

export default function UnitInput({ unit, className, ...extraProps }) {
  return (
    <div className={`${styles.container} ${className}`}>
      <input {...extraProps} className={styles.input}></input>
      {unit && <span className={styles.unit}>{unit}</span>}
    </div>
  );
}
