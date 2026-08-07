export function canonicalize(router) {
  return router.asPath.split(/[?#]/)[0];
}
