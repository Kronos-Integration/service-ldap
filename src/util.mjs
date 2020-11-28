export function expand(str, params) {
  return typeof str === "string"
    ? str.replace(/\{\{(\w+)\}\}/, (match, g1) =>
        params[g1] ? params[g1] : g1
      )
    : str;
}
