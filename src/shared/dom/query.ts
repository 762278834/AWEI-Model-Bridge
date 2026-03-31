export const qs = <T extends HTMLElement>(selector: string): T => {
  const el = document.querySelector(selector);
  if (!el) {
    throw new Error(`missing element: ${selector}`);
  }
  return el as T;
};
