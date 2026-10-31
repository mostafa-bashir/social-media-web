"use client";

import type { TextAreaRef } from "antd/es/input/TextArea";
import { useRef } from "react";

import { insertAtCursor } from "../lib/insert-at-cursor";

/** A ref for the caption box, and `insert` to add text where its cursor is. */
export function useCaptionInsert(
  value: string,
  onChange: (value: string) => void,
) {
  const textAreaRef = useRef<TextAreaRef>(null);

  const insert = (text: string) => {
    const element = textAreaRef.current?.resizableTextArea?.textArea;
    // Without focus history the cursor is at the end.
    const start = element?.selectionStart ?? value.length;
    const end = element?.selectionEnd ?? value.length;
    const next = insertAtCursor(value, start, end, text);
    onChange(next.value);
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(next.cursor, next.cursor);
    });
  };

  return { textAreaRef, insert };
}
