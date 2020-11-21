import React from "react";

export default class ResizableContainer extends React.Component {
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
