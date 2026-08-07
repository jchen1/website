import type { ReactNode } from "react";

import styles from "styles/components/MainContainer.module.scss";

interface MainContainerProps {
  children?: ReactNode;
}

export default function MainContainer({ children }: MainContainerProps) {
  return <main className={styles.container}>{children}</main>;
}
