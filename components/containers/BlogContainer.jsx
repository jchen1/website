import styles from "styles/components/BlogContainer.module.scss";

export default function BlogContainer({ children }) {
  return <main className={styles.container}>{children}</main>;
}
