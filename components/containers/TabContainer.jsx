import React from "react";
import styled from "styled-components";

import { Colors } from "../../lib/metrics";

const TabContainerRoot = styled.div`
  flex-basis: 100%;
  display: flex;

  border-bottom: 1px solid ${Colors.LIGHT_GRAY};
  margin: 1rem 0 2rem 0;
  height: 3rem;
`;

const Tab = styled.div`
  color: ${Colors.GRAY};
  user-select: none;
  cursor: pointer;
  outline: 0;
  margin: 0 1rem;

  &:first-child {
    margin-left: 0rem;
  }

  .text {
    display: inline-block;
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }

  &.active {
    color: ${Colors.BLACK};
    font-weight: bold;
    border-bottom: 1px solid ${Colors.BLACK};
  }
`;

export default function TabContainer({ tabs, activeTab, setActiveTab }) {
  const tabMarkup = tabs.map(({ name, value }, idx) => (
    <Tab
      className={activeTab === value ? "active" : "inactive"}
      tabIndex={idx}
      key={name}
      role="button"
      onClick={e => setActiveTab(value)}
    >
      <span className="text">{name}</span>
    </Tab>
  ));
  return <TabContainerRoot>{tabMarkup}</TabContainerRoot>;
}
