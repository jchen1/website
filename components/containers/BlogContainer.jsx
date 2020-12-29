import styles from "styles/components/BlogContainer.module.scss";

export default function BlogContainer({ children }) {
  return <article className={styles.article}>{children}</article>;
}
