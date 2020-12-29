import styles from "styles/components/BlogContainer.module.scss";

export default function BlogContainer({ children }) {
  return <div className={styles.container}>{children}</div>;
}
