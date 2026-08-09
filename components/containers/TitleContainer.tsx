import React from "react";

import styles from "styles/components/TitleContainer.module.scss";

import type { ReactNode } from "react";

interface TitleContainerProps {
  children?: ReactNode;
}

export default function TitleContainer({ children }: TitleContainerProps) {
  return <div className={styles.container}>{children}</div>;
}
