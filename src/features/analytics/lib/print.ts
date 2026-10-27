/** Paper is white: print in the light theme, then restore the viewer's. */
export function printInLightTheme() {
  const root = document.documentElement;
  const previous = root.dataset.theme;
  root.dataset.theme = "light";
  const restore = () => {
    if (previous) root.dataset.theme = previous;
    else delete root.dataset.theme;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}
