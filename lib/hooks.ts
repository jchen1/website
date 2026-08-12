import { useEffect, useRef, useState } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// On statically generated pages the query string only exists on the client:
// `router.query` is empty during the first render, so state initializers
// can't see it. Runs `init` with the parsed query string once on mount, and
// returns whether that has happened — effects that write state back to the
// URL must wait for `true`, or they overwrite the params with defaults.
export function useInitialQueryParams(
  init: (params: URLSearchParams) => void,
): boolean {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    init(new URLSearchParams(window.location.search));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return loaded;
}
