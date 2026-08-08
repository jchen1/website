import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { event } from "lib/gtag";
import { SEARCH_INDEX_PATH } from "lib/searchIndex";

import styles from "styles/components/CommandPalette.module.scss";

import type {
  SearchIndex,
  SearchIndexGroup,
  SearchIndexItem,
} from "lib/searchIndex";

const MAX_RESULTS = 15;
const RECENT_POST_COUNT = 5;
const OPTION_ID_PREFIX = "command-palette-option-";

let indexPromise: Promise<SearchIndex> | null = null;

export function preloadSearchIndex(): Promise<SearchIndex> {
  if (!indexPromise) {
    indexPromise = fetch(SEARCH_INDEX_PATH)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch search index: ${res.status}`);
        }
        return res.json() as Promise<SearchIndex>;
      })
      .catch((err: unknown) => {
        indexPromise = null;
        throw err;
      });
  }
  return indexPromise;
}

// Match tiers: substring (prefix beats mid-string), then title words
// prefixed by every query word, then in-order character subsequence.
function score(title: string, query: string): number {
  const t = title.toLowerCase();
  const idx = t.indexOf(query);
  if (idx === 0) return 4;
  if (idx > 0) return 3;

  const queryWords = query.split(/[^a-z0-9]+/).filter(Boolean);
  const titleWords = t.split(/[^a-z0-9]+/);
  if (
    queryWords.length &&
    queryWords.every(q => titleWords.some(w => w.startsWith(q)))
  ) {
    return 2;
  }

  let i = 0;
  for (const c of t) {
    if (c === query[i]) i++;
    if (i === query.length) return 1;
  }
  return 0;
}

function matchItems(items: SearchIndexItem[], query: string) {
  if (!query) {
    const pages = items.filter(item => item.group === "Pages");
    const recentPosts = items
      .filter(item => item.group === "Posts" && item.date)
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, RECENT_POST_COUNT);
    return [...pages, ...recentPosts];
  }
  return items
    .map((item, order) => ({ item, order, score: score(item.title, query) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, MAX_RESULTS)
    .map(r => r.item);
}

interface ResultGroup {
  group: SearchIndexGroup;
  start: number;
  items: SearchIndexItem[];
}

function groupResults(results: SearchIndexItem[]): ResultGroup[] {
  const groups: ResultGroup[] = [];
  for (const item of results) {
    let group = groups.find(g => g.group === item.group);
    if (!group) {
      group = { group: item.group, start: 0, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  let start = 0;
  for (const group of groups) {
    group.start = start;
    start += group.items.length;
  }
  return groups;
}

function scrollOptionIntoView(el: HTMLAnchorElement | null) {
  el?.scrollIntoView({ block: "nearest" });
}

export interface CommandPaletteProps {
  onClose: () => void;
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    event({ action: "command-palette-open", category: "engagement" });
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    preloadSearchIndex()
      .then(idx => !cancelled && setIndex(idx))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(
    () =>
      groupResults(matchItems(index?.items ?? [], query.trim().toLowerCase())),
    [index, query],
  );
  const flat = useMemo(() => groups.flatMap(g => g.items), [groups]);
  const selectedIndex = flat.length ? Math.min(selected, flat.length - 1) : -1;

  const trackSelect = useCallback(
    (item: SearchIndexItem) => {
      event({
        action: "command-palette-select",
        category: "engagement",
        label: item.route,
      });
      onClose();
    },
    [onClose],
  );

  const navigate = useCallback(
    (item: SearchIndexItem) => {
      trackSelect(item);
      void router.push(item.route);
    },
    [router, trackSelect],
  );

  const onQueryChange = useCallback((e: Event) => {
    setQuery((e.target as HTMLInputElement).value);
    setSelected(0);
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.isComposing) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!flat.length) return;
        const delta = e.key === "ArrowDown" ? 1 : -1;
        setSelected(
          s =>
            (Math.min(s, flat.length - 1) + delta + flat.length) % flat.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flat[selectedIndex];
        if (item) navigate(item);
      } else if (e.key === "Tab") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    [flat, selectedIndex, navigate, onClose],
  );

  const onPanelMouseDown = useCallback((e: MouseEvent) => {
    if (e.target !== inputRef.current) {
      e.preventDefault();
    }
  }, []);

  const onBackdropClick = useCallback(
    (e: MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <div
      className={styles.overlay}
      onClick={onBackdropClick}
      onKeyDown={onKeyDown}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Site search"
        onMouseDown={onPanelMouseDown}
      >
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="Search posts and pages…"
          value={query}
          onChange={onQueryChange}
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-controls="command-palette-listbox"
          aria-activedescendant={
            selectedIndex >= 0
              ? `${OPTION_ID_PREFIX}${selectedIndex}`
              : undefined
          }
        />
        <div
          className={styles.results}
          role="listbox"
          id="command-palette-listbox"
          aria-label="Search results"
        >
          {failed && (
            <div className={styles.status}>Failed to load search index.</div>
          )}
          {!failed && !index && <div className={styles.status}>Loading…</div>}
          {!failed && index && !flat.length && (
            <div className={styles.status}>No results.</div>
          )}
          {groups.map((group, gi) => (
            <div
              key={group.group}
              role="group"
              aria-labelledby={`command-palette-group-${gi}`}
            >
              <div
                className={styles.groupHeading}
                id={`command-palette-group-${gi}`}
              >
                {group.group}
              </div>
              {group.items.map((item, j) => {
                const i = group.start + j;
                const isSelected = i === selectedIndex;
                return (
                  <Link
                    key={item.route}
                    href={item.route}
                    id={`${OPTION_ID_PREFIX}${i}`}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    className={
                      isSelected
                        ? `${styles.option} ${styles.optionSelected}`
                        : styles.option
                    }
                    ref={isSelected ? scrollOptionIntoView : undefined}
                    onMouseMove={() => setSelected(i)}
                    onClick={() => trackSelect(item)}
                  >
                    <span className={styles.title}>{item.title}</span>
                    {item.date && (
                      <span className={styles.date}>{item.date}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
