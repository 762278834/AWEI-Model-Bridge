import { qs } from "../../shared/dom/query";

const outputEl = () => qs<HTMLPreElement>("#output");
const stateEl = () => qs<HTMLPreElement>("#state");

export const outputFeature = {
  setOutput(text: string) {
    outputEl().textContent = text;
  },
  setState(text: string) {
    stateEl().textContent = text;
  },
};
