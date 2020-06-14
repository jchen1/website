---
layout: post
title: Detecting Widows in React
date: "2019-08-08"
author: Jeff Chen
tags: resume,react,widow,typography,javascript,js
---

![widows](/images/widows.png)

I've been working with fixed-width containers in React recently, so I've been able to focus on typesetting. One problem I've had is noticing [widows](https://www.fonts.com/content/learning/fontology/level-2/text-typography/rags-widows-orphans) in paragraph text as I change copy and styling. (`widow` is apparently an overloaded term in typesetting -- here, I mean a single word that overflows into a new line, not a single line overflowing into a new page.) I ended up building a React component that automates widow detection - let's dig in!

<!-- excerpt -->

## Getting a container reference in React

First, we'll build a component that wraps its child in a container. We'll use a reference to this container to see if the child element has a widow. Our component will report widows with the `data-has-widow` attribute.

```jsx
import React from 'react';

class ComponentReportingWidows extends React.PureComponent {
  constructor(props) {
    super(props);
    // prevent undefined errors in render() when state is null
    this.state = {};
  }

  function getLineCount(el) {
    return 0; // TODO
  }

  hasWidows() {
    return false; // TODO
  }

  componentDidMount() {
    this.setState({
      hasWidow: this.hasWidows()
    });
  }

  render() {
    return (
      <div data-has-widow={this.state.hasWidow}
           ref={c => this.container = c}>
        {React.Children.only(this.props.children)}
      </div>
    )
  }
}
```

## Calculating number of lines in an element

Once we have a reference to the container, we need to figure out how many lines of text it contains. We can divide its height by the container's line height:

```jsx
function getLineCount(el) {
  const height = el.clientHeight;
  // use computedStyle because line-height could be unset
  const lineHeight = window
    .getComputedStyle(el)
    .getPropertyValue("line-height");

  return Math.floor(height / parseFloat(lineHeight));
}
```

## Detecting widows

Finally, we need a way to detect a widowed element. To do this, we'll create a hidden `div` with no `max-width` and outside the normal document flow: (Note - I really wouldn't do this in production, especially with dynamic elements, since it duplicates the child element)

```jsx
render() {
  const hiddenContainerStyles = {
    "position": "absolute",
    "visibility": "hidden",
    "max-width": "unset"
  };

  return (
    <div data-has-widow={this.state.hasWidow}
         ref={c => this.container = c}>
      <div style={hiddenContainerStyles}
           ref={hc => this.hiddenContainer = hc}>
        {React.Children.only(this.props.children)}
      </div>
      {React.Children.only(this.props.children)}
    </div>
  );
}
```

We need this hidden container to get the unconstrained width of the child. With it, we can calculate if a container has a widow. We consider a container widowed if the width of its last line is less than 10% of the total container width. We can figure that out with some clever arithmetic:

```jsx
const DEFAULT_WIDOW_THRESHOLD = 0.1;

hasWidows() {
  const containerWidth = this.container.clientWidth;
  const containerLines = getLineCount(this.container);

  const hiddenContainerWidth = this.hiddenContainer.clientWidth;
  const trailingLineWidth =
    hiddenContainerWidth - (containerWidth * (containerLines - 1));

  const widowThreshold =
    DEFAULT_WIDOW_THRESHOLD * containerWidth;

  return hiddenContainerWidth > containerWidth &&
         trailingLineWidth - containerWidth < widowThreshold;
}
```

And that's it! Putting it all together:

```jsx
import React from 'react';

const DEFAULT_WIDOW_THRESHOLD = 0.1;

class ComponentReportingWidows extends React.PureComponent {
  constructor(props) {
    super(props);
    // prevent undefined errors in render() when state is null
    this.state = {};
  }

  function getLineCount(el) {
    const height = el.clientHeight;
    // use computedStyle because line-height could be unset
    const lineHeight = window.getComputedStyle(el)
                            .getPropertyValue("line-height");

    return Math.floor(height / parseFloat(lineHeight));
  }

  hasWidows() {
    const containerWidth = this.container.clientWidth;
    const containerLines = getLineCount(this.container);

    const hiddenContainerWidth = this.hiddenContainer.clientWidth;
    const trailingLineWidth =
      hiddenContainerWidth - (containerWidth * (containerLines - 1));

    const widowThreshold =
      DEFAULT_WIDOW_THRESHOLD * containerWidth;

    return hiddenContainerWidth > containerWidth &&
          trailingLineWidth - containerWidth < widowThreshold;
  }

  componentDidMount() {
    this.setState({
      hasWidow: this.hasWidows()
    });
  }

  render() {
    const hiddenContainerStyles = {
      "position": "absolute",
      "visibility": "hidden",
      "max-width": "unset"
    };

    return (
      <div data-has-widow={this.state.hasWidow}
          ref={c => this.container = c}>
        <div style={hiddenContainerStyles}
            ref={hc => this.hiddenContainer = hc}>
          {React.Children.only(this.props.children)}
        </div>
        {React.Children.only(this.props.children)}
      </div>
    );
  }
}
```

I came across this use case when rewriting my résumé in React -- where my constraints were very different from day-to-day web development. Instead of making dynamic content look acceptable on viewports of all shapes and sizes, I was focused on readability for a single size - a single sheet of US Letter.
