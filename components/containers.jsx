import React from "react";
import styled from "styled-components";

import { Colors } from "../lib/constants";

export const RootContainer = styled.div`
  min-height: 100vh;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @media screen and (max-width: 640px) {
    padding: 0 1rem;
  }
`;

export const MainContainer = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`;

export const TitleContainer = styled.div`
  display: flex;
  margin: 0 0 1rem 0;
  align-items: center;
  justify-content: space-evenly;

  h1 {
    font-size: 3rem;
    margin: 0;
  }
`;

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

export function TabContainer({ tabs, activeTab, setActiveTab }) {
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

export class ResizableContainer extends React.Component {
  constructor(props) {
    super(props);
    this.el = React.createRef();
  }

  onResize(evt) {
    if (!this.el?.current) return;

    const rect = this.el.current.getBoundingClientRect();
    return this.props.onResize(evt, rect);
  }

  componentDidMount() {
    if (this.el?.current) {
      this.ro = new ResizeObserver(e => this.onResize(e));
      this.ro.observe(this.el.current);

      this.onResize();
    }
  }

  componentWillUnmount() {
    this.ro?.disconnect();
  }

  render() {
    return (
      <div className={this.props.className} ref={this.el}>
        {this.props.children}
      </div>
    );
  }
}
