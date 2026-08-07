import React from "react";

import type { ReactNode, RefObject } from "react";

interface ResizableContainerProps {
  onResize: (entries: ResizeObserverEntry[] | undefined, rect: DOMRect) => void;
  className?: string;
  children?: ReactNode;
}

export default class ResizableContainer extends React.Component<ResizableContainerProps> {
  el: RefObject<HTMLDivElement>;
  ro?: ResizeObserver;

  constructor(props: ResizableContainerProps) {
    super(props);
    this.el = React.createRef<HTMLDivElement>();
  }

  onResize(evt?: ResizeObserverEntry[]) {
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
