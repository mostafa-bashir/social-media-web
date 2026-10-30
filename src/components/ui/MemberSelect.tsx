"use client";

import { Select } from "antd";
import { useMemo, useState } from "react";

import MemberAvatar from "@/components/ui/MemberAvatar";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useMemberOptions } from "@/hooks/use-member-options";

const SEARCH_DEBOUNCE_MS = 300;

export interface KnownMember {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

export interface MemberSelectProps {
  value?: string[];
  onChange?: (userIds: string[]) => void;
  /** Members already picked, so their names show before the search loads them. */
  known?: KnownMember[];
  placeholder?: string;
  maxCount?: number;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

/**
 * Multi-member picker (assignees) that searches on the server. Works as a
 * controlled antd Form field.
 */
export default function MemberSelect({
  value,
  onChange,
  known = [],
  ...selectProps
}: MemberSelectProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const matches = useMemberOptions(debouncedSearch);

  const options = useMemo(() => {
    const byId = new Map<string, KnownMember>(
      known.map((member) => [member.userId, member]),
    );
    for (const member of matches.data ?? []) byId.set(member.userId, member);
    // A plain-text label keeps the options' accessible names readable.
    return [...byId.values()].map((member) => ({
      value: member.userId,
      label: member.name,
      avatarUrl: member.avatarUrl,
    }));
  }, [known, matches.data]);

  return (
    <Select
      {...selectProps}
      mode="multiple"
      showSearch={{ filterOption: false, onSearch: setSearch }}
      loading={matches.isFetching}
      value={value}
      options={options}
      optionRender={({ data }) => (
        <span className="inline-flex items-center gap-2">
          <MemberAvatar
            name={data.label}
            avatarUrl={data.avatarUrl}
            size={20}
            showTooltip={false}
          />
          {data.label}
        </span>
      )}
      onChange={(userIds: string[]) => {
        setSearch("");
        onChange?.(userIds);
      }}
    />
  );
}
