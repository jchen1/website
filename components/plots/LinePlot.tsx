import uPlot from "uplot";
import React from "react";

import ResizableContainer from "../containers/ResizableContainer";
import { Colors } from "../../lib/metrics";
import { tooltipsPlugin } from "../../lib/chartPlugins";

import styles from "styles/components/LinePlot.module.scss";

import type { ReactNode, RefObject } from "react";
import type { PlotConfig } from "../../lib/metrics";
import type { SeriesData } from "../../lib/metricsUtils";

const defaultSeriesOpts = {
  show: true,
  stroke: Colors.YELLOW,
};

interface LinePlotProps {
  data: SeriesData;
  title?: string;
  opts?: PlotConfig;
  series?: uPlot.Series[];
  legend?: uPlot.Legend;
  cursor?: uPlot.Cursor;
  class?: string;
  /** plot height as a fraction of its measured width */
  aspectRatio?: number;
  children?: ReactNode;
}

interface LinePlotState {
  height: number | null;
  width: number | null;
}

function mountPlot(
  el: HTMLDivElement,
  props: LinePlotProps,
  width: number,
  height: number,
) {
  const { title, data } = props;

  const series = (props.series || [])
    .map(s => ({ ...defaultSeriesOpts, ...s }))
    .concat(
      Array(data.length - (props.series || []).length)
        .fill(null)
        .map(a => ({
          ...defaultSeriesOpts,
        })),
    );

  if (props.opts && props.opts.unit) {
    series[1].label = props.opts.unit;
  }

  const opts: uPlot.Options = {
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

export default class LinePlot extends React.Component<
  LinePlotProps,
  LinePlotState
> {
  state: LinePlotState = {
    height: null,
    width: null,
  };

  el: RefObject<HTMLDivElement>;
  plot?: uPlot;

  constructor(props: LinePlotProps) {
    super(props);
    this.el = React.createRef<HTMLDivElement>();
  }

  onResize(evt: ResizeObserverEntry[] | undefined, rect: DOMRect) {
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

  componentDidUpdate(prevProps: LinePlotProps) {
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
      <ResizableContainer
        className={styles.container}
        onResize={this.onResize.bind(this)}
      >
        <div
          style={height !== null && height > 0 ? { height: `${height}px` } : {}}
          ref={this.el}
        >
          {this.props.children}
        </div>
      </ResizableContainer>
    );
  }
}
