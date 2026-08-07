import type { NextRouter } from "next/router";

export function canonicalize(router: NextRouter) {
  return router.asPath.split(/[?#]/)[0];
}
