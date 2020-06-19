import uPlot from "uplot";
import React from "react";
import styled from "styled-components";

import { Colors } from "../lib/constants";
import { tooltipsPlugin } from "../lib/chartPlugins";

const defaultSeriesOpts = {
  show: true,
  stroke: Colors.RED,
  // fill: Colors.RED,
};

const Container = styled.div`
  flex-basis: 50%;
  margin: 50px 0;

  &:nth-of-type(1),
  &:nth-of-type(2) {
    margin-top: 0;
  }

  @media screen and (max-width: 640px) {
    flex-basis: 100%;

    &:nth-of-type(2) {
      margin-top: 50px;
    }
  }

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
    title: title || props.opts.name,
    width,
    height,
    class: props.class || "spark",
    series,
    plugins: [tooltipsPlugin()],
  };

  return new uPlot(opts, data, el);
}

export default class Plot extends React.Component {
  state = {
    dimensions: null,
  };

  onResize() {
    if (this.el) {
      this.setState({
        dimensions: {
          width: this.el.offsetWidth,
          height: this.el.offsetWidth * (this.props.aspectRatio || 0.5),
        },
      });
    }
  }

  componentDidMount() {
    if (this.el) {
      this.ro = new ResizeObserver(e => this.onResize());
      this.ro.observe(this.el);

      this.setState({
        dimensions: {
          width: this.el.offsetWidth,
          height: this.el.offsetWidth * (this.props.aspectRatio || 0.5),
        },
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.plot) {
      if (this.props.data[0].length !== prevProps.data[0].length) {
        this.plot.setData(this.props.data);
      }

      const { dimensions } = this.state;

      if (
        dimensions !== null &&
        (this.plot.width !== dimensions.width ||
          this.plot.height !== dimensions.height)
      ) {
        this.plot.setSize({
          width: dimensions.width,
          height: dimensions.height,
        });
      }
    } else {
      if (this.state.dimensions !== null) {
        this.plot = mountPlot(
          this.el,
          this.props,
          this.state.dimensions.width,
          this.state.dimensions.height
        );
      }
    }
  }

  componentWillUnmount() {
    if (this.plot) {
      this.plot.destroy();
    }
    this.ro?.disconnect();
  }

  render() {
    const { dimensions } = this.state;
    return (
      <Container
        ref={el => (this.el = el)}
        style={dimensions ? { height: `${dimensions.height}px` } : {}}
      >
        {this.props.children}
      </Container>
    );
  }
}
