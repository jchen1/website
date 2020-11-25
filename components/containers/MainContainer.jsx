import styles from "styles/components/MainContainer.module.scss";

export default function MainContainer({ children }) {
  return <main className={styles.container}>{children}</main>;
}
