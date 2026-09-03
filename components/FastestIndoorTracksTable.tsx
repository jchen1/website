import React, { useEffect, useId, useMemo, useState } from "react";

import venuesData from "data/fastestIndoorTracks.json";
import styles from "styles/components/FastestIndoorTracksTable.module.scss";

const PAGE_SIZE = 15;
const VENUE_HASH_PREFIX = "venue-";
const numberFormatter = new Intl.NumberFormat("en-US");

interface Venue {
  rank: number;
  venue: string;
  elevationFt: number;
  advantageMs: number;
}

interface LinkedVenue extends Venue {
  displayVenue: string;
  slug: string;
}

interface PaginationControlsProps {
  currentPage: number;
  pageCount: number;
  shownStart: number;
  shownEnd: number;
  resultCount: number;
  liveStatus?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const VENUE_QUALIFIER_PATTERN = / \((?:Flat|Banked|I)\)/g;

function displayVenueName(venue: string) {
  return venue.replace(VENUE_QUALIFIER_PATTERN, "");
}

function slugifyVenue(venue: string) {
  return venue
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const venues: LinkedVenue[] = (venuesData as Venue[]).map(venue => ({
  ...venue,
  displayVenue: displayVenueName(venue.venue),
  slug: slugifyVenue(displayVenueName(venue.venue)),
}));
const venueIndexesBySlug = new Map(
  venues.map((venue, index) => [venue.slug, index]),
);

function venueId(slug: string) {
  return `${VENUE_HASH_PREFIX}${slug}`;
}

function venueSlugFromHash(hash: string) {
  const id = hash.replace(/^#/, "");
  return id.startsWith(VENUE_HASH_PREFIX)
    ? id.slice(VENUE_HASH_PREFIX.length)
    : null;
}

function formatMilliseconds(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function PaginationControls({
  currentPage,
  pageCount,
  shownStart,
  shownEnd,
  resultCount,
  liveStatus = false,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  return (
    <div className={styles.pagination}>
      <button type="button" disabled={currentPage === 0} onClick={onPrevious}>
        ← Previous
      </button>
      <span
        className={styles.pageStatus}
        aria-live={liveStatus ? "polite" : undefined}
      >
        {shownStart}–{shownEnd} of {resultCount}
      </span>
      <button
        type="button"
        disabled={currentPage >= pageCount - 1}
        onClick={onNext}
      >
        Next →
      </button>
    </div>
  );
}

export default function FastestIndoorTracksTable() {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [linkedVenueSlug, setLinkedVenueSlug] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    function syncVenueFromHash() {
      const slug = venueSlugFromHash(window.location.hash);
      const venueIndex = slug ? venueIndexesBySlug.get(slug) : undefined;

      if (slug === null || venueIndex === undefined) {
        setLinkedVenueSlug(null);
        return;
      }

      setQuery("");
      setPage(Math.floor(venueIndex / PAGE_SIZE));
      setLinkedVenueSlug(slug);
    }

    syncVenueFromHash();
    window.addEventListener("hashchange", syncVenueFromHash);
    return () => window.removeEventListener("hashchange", syncVenueFromHash);
  }, []);

  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return venues;

    return venues.filter(({ displayVenue }) =>
      displayVenue.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filteredVenues.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const firstResult = currentPage * PAGE_SIZE;
  const pageVenues = filteredVenues.slice(firstResult, firstResult + PAGE_SIZE);
  const shownStart = filteredVenues.length === 0 ? 0 : firstResult + 1;
  const shownEnd = Math.min(firstResult + PAGE_SIZE, filteredVenues.length);

  useEffect(() => {
    if (!linkedVenueSlug) return;

    const animationFrame = window.requestAnimationFrame(() => {
      const row = document.getElementById(venueId(linkedVenueSlug));
      if (!row) return;

      row.focus({ preventScroll: true });
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [currentPage, linkedVenueSlug]);

  function clearLinkedVenue() {
    if (!venueSlugFromHash(window.location.hash)) return;

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    setLinkedVenueSlug(null);
  }

  async function copyVenueLink(venue: LinkedVenue) {
    const url = new URL(window.location.href);
    url.hash = venueId(venue.slug);

    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus(`Link to ${venue.displayVenue} copied.`);
    } catch {
      setShareStatus(
        `Link to ${venue.displayVenue} selected in the address bar.`,
      );
    }
  }

  function showPreviousPage() {
    clearLinkedVenue();
    setPage(current => Math.max(0, current - 1));
  }

  function showNextPage() {
    clearLinkedVenue();
    setPage(current => Math.min(pageCount - 1, current + 1));
  }

  return (
    <section className={styles.container} aria-label="Indoor track rankings">
      <label className={styles.searchLabel} htmlFor={searchId}>
        Search venues
      </label>
      <input
        id={searchId}
        className={styles.search}
        type="search"
        value={query}
        placeholder="Venue, city, or state"
        onChange={event => {
          clearLinkedVenue();
          setQuery(event.currentTarget.value);
          setPage(0);
        }}
      />

      <div className={styles.topPagination}>
        <PaginationControls
          currentPage={currentPage}
          pageCount={pageCount}
          shownStart={shownStart}
          shownEnd={shownEnd}
          resultCount={filteredVenues.length}
          liveStatus
          onPrevious={showPreviousPage}
          onNext={showNextPage}
        />
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <caption className="sr-only">
            Estimated performance advantage for 204 indoor track venues
          </caption>
          <thead>
            <tr>
              <th className={`${styles.rank} ${styles.numeric}`} scope="col">
                #
              </th>
              <th className={styles.venue} scope="col">
                Venue
              </th>
              <th
                className={`${styles.elevation} ${styles.numeric}`}
                scope="col"
              >
                Elevation
              </th>
              <th
                className={`${styles.advantage} ${styles.numeric}`}
                scope="col"
              >
                Advantage
              </th>
            </tr>
          </thead>
          <tbody>
            {pageVenues.length > 0 ? (
              pageVenues.map(venue => (
                <tr
                  id={venueId(venue.slug)}
                  key={venue.venue}
                  className={
                    linkedVenueSlug === venue.slug ? styles.linked : undefined
                  }
                  tabIndex={-1}
                  aria-current={
                    linkedVenueSlug === venue.slug ? "location" : undefined
                  }
                >
                  <td className={`${styles.rank} ${styles.numeric}`}>
                    {venue.rank}
                  </td>
                  <td className={styles.venue}>
                    <span className={styles.venueName}>
                      {venue.displayVenue}
                    </span>{" "}
                    <a
                      className={styles.shareLink}
                      href={`#${venueId(venue.slug)}`}
                      aria-label={`Copy link to ${venue.displayVenue}`}
                      title="Copy link to this venue"
                      onClick={() => copyVenueLink(venue)}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                      >
                        <path d="M10.6 13.4a1 1 0 0 0 1.4 0l2.8-2.8a1 1 0 1 0-1.4-1.4L10.6 12a1 1 0 0 0 0 1.4Z" />
                        <path d="M8.5 17.5H7a4.5 4.5 0 0 1 0-9h3a1 1 0 1 1 0 2H7a2.5 2.5 0 0 0 0 5h1.5a1 1 0 1 1 0 2Zm8.5-2h-3a1 1 0 1 1 0-2h3a2.5 2.5 0 0 0 0-5h-1.5a1 1 0 1 1 0-2H17a4.5 4.5 0 0 1 0 9Z" />
                      </svg>
                    </a>
                    <span className={styles.mobileDetails}>
                      {numberFormatter.format(venue.elevationFt)} ft
                    </span>
                  </td>
                  <td className={`${styles.elevation} ${styles.numeric}`}>
                    {numberFormatter.format(venue.elevationFt)} ft
                  </td>
                  <td className={`${styles.advantage} ${styles.numeric}`}>
                    <span className={styles.advantageValue}>
                      {formatMilliseconds(venue.advantageMs)} ms
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={styles.empty} colSpan={4}>
                  No venues match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        pageCount={pageCount}
        shownStart={shownStart}
        shownEnd={shownEnd}
        resultCount={filteredVenues.length}
        onPrevious={showPreviousPage}
        onNext={showNextPage}
      />
      <span className="sr-only" aria-live="polite">
        {shareStatus}
      </span>
    </section>
  );
}
