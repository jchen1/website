import type { ReactNode } from "react";

import styles from "styles/components/BlogContainer.module.scss";

interface BlogContainerProps {
  children?: ReactNode;
}

export default function BlogContainer({ children }: BlogContainerProps) {
  return <main className={styles.container}>{children}</main>;
}
