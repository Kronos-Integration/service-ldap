import { expand as paccExpand } from "pacc";

export function expand(value, params) {
  return paccExpand(value, {
    leadIn: "{{",
    leadOut: "}}",
    root: params
  });
}
