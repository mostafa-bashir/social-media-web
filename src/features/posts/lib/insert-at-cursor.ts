/**
 * `text` placed over the selection, with a space added where it would
 * otherwise run into a neighbouring word. Returns the new value and where
 * the cursor goes.
 */
export function insertAtCursor(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  text: string,
): { value: string; cursor: number } {
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const lead = before && !/\s$/.test(before) ? " " : "";
  const trail = after && !/^\s/.test(after) ? " " : "";
  const inserted = `${lead}${text}${trail}`;
  return {
    value: `${before}${inserted}${after}`,
    cursor: before.length + inserted.length,
  };
}
