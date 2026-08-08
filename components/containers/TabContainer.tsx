import React from "react";

import styles from "styles/components/TabContainer.module.scss";

interface TabDefinition {
  name: string;
  value: string;
}

interface TabContainerProps {
  tabs: TabDefinition[];
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export default function TabContainer({
  tabs,
  activeTab,
  setActiveTab,
}: TabContainerProps) {
  const tabMarkup = tabs.map(({ name, value }, idx) => (
    <div
      className={
        activeTab === value ? `${styles.tab} ${styles.active}` : styles.tab
      }
      tabIndex={idx}
      key={name}
      role="button"
      onClick={e => setActiveTab(value)}
    >
      <span className={styles.text}>{name}</span>
    </div>
  ));
  return <div className={styles.container}>{tabMarkup}</div>;
}
