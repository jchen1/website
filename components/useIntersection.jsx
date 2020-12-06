import { useCallback, useRef, useState } from "react";

const observers = new Map();
function createObserver(options) {
  const id = options.rootMargin || "";
  let instance = observers.get(id);
  if (instance) {
    return instance;
  }

  const elements = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const callback = elements.get(entry.target);
      const isVisible = entry.isIntersecting || entry.intersectionRatio > 0;
      if (callback && isVisible) {
        callback(isVisible);
      }
    });
  }, options);

  observers.set(
    id,
    (instance = {
      id,
      observer,
      elements,
    })
  );
  return instance;
}

function observe(element, callback, options) {
  const { id, observer, elements } = createObserver(options);
  elements.set(element, callback);

  observer.observe(element);
  return function unobserve() {
    observer.unobserve(element);

    // Destroy observer when there's nothing left to watch:
    if (elements.size === 0) {
      observer.disconnect();
      observers.delete(id);
    }
  };
}

export function useIntersection({ rootMargin, disabled }) {
  const unobserve = useRef();
  const [visible, setVisible] = useState(false);

  const setRef = useCallback(
    el => {
      if (unobserve.current) {
        unobserve.current();
        unobserve.current = undefined;
      }

      if (disabled || visible) return;

      if (el && el.tagName) {
        unobserve.current = observe(
          el,
          isVisible => isVisible && setVisible(isVisible),
          { rootMargin }
        );
      }
    },
    [disabled, rootMargin, visible]
  );

  return [setRef, visible];
}
