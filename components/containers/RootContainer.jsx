import styles from "styles/components/MainContainer.module.scss";

export default function RootContainer({ children }) {
  return <div className={styles.container}>{children}</div>;
}
