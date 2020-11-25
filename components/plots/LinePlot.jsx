import uPlot from "uplot";
import React from "react";
import styled from "styled-components";

import ResizableContainer from "../containers/ResizableContainer";
import { Colors } from "../../lib/metrics";
import { tooltipsPlugin } from "../../lib/chartPlugins";

const defaultSeriesOpts = {
  show: true,
  stroke: Colors.RED,
  // fill: Colors.RED,
};

const Container = styled(ResizableContainer)`
  position: relative;

  .uplot {
    position: absolute;
  }
`;

function mountPlot(el, props, width, height) {
  const { title, data } = props;

  const series = (props.series || [])
    .map(s => ({ ...defaultSeriesOpts, ...s }))
    .concat(
      Array(data.length - (props.series || []).length)
        .fill(null)
        .map(a => ({
          ...defaultSeriesOpts,
        }))
    );

  if (props.opts && props.opts.unit) {
    series[1].label = props.opts.unit;
  }

  const opts = {
    ...props.opts,
    title: "",
    width,
    height,
    class: props.class || "spark",
    series,
    legend: props.legend || { show: false },
    cursor: { y: false, ...(props.cursor || {}) },
    plugins: [tooltipsPlugin(props.opts)],
  };

  return new uPlot(opts, data, el);
}

export default class LinePlot extends React.Component {
  state = {
    height: null,
    width: null,
  };

  constructor(props) {
    super(props);
    this.el = React.createRef();
  }

  onResize(evt, rect) {
    if (this.el?.current) {
      const width = rect.width;
      const height = rect.width * (this.props.aspectRatio || 0.5);

      if (this.plot) {
        if (this.plot.width !== width || this.plot.height !== height) {
          this.plot.setSize({ width, height });
        }
      } else {
        this.plot = mountPlot(this.el.current, this.props, width, height);
      }

      this.setState({ width, height });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.data[0].length !== prevProps.data[0].length) {
      this.plot?.setData(this.props.data);
    }
  }

  componentWillUnmount() {
    this.plot?.destroy();
  }

  render() {
    const { height } = this.state;

    return (
      <Container onResize={this.onResize.bind(this)}>
        <div style={height > 0 ? { height: `${height}px` } : {}} ref={this.el}>
          {this.props.children}
        </div>
      </Container>
    );
  }
}
