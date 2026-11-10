"use client";

import { Collapse } from "antd";

export default function FaqAccordion({
  items,
}: {
  items: readonly { key: string; question: string; answer: string }[];
}) {
  return (
    <Collapse
      bordered={false}
      expandIconPlacement="end"
      size="large"
      className="bg-transparent!"
      items={items.map(({ key, question, answer }) => ({
        key,
        label: (
          <span className="font-semibold text-text-primary">{question}</span>
        ),
        children: (
          <p className="leading-relaxed text-text-secondary">{answer}</p>
        ),
      }))}
    />
  );
}
