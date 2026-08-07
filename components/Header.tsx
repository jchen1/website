import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { SITE_TITLE } from "lib/constants";

import Image from "components/Image";
import { Twitter } from "components/Icon";
import SearchIcon from "assets/search.svg";

import styles from "styles/components/Header.module.scss";

const PROFILE_SIZE = 320;

export interface HeaderProps {
  onOpenPalette: () => void;
  onPreloadPalette: () => void;
}

export default function Header({
  onOpenPalette,
  onPreloadPalette,
}: HeaderProps) {
  const router = useRouter();
  // prevent "auto-prefetch based on viewport... warning"
  const prefetch = router.pathname === "/" ? false : undefined;
  return (
    <header className={styles.container}>
      <div className={styles.row}>
        <Link
          href="/"
          prefetch={prefetch}
          className={styles.siteAvatar}
          aria-label="Home"
        >
          <Image
            src="/images/headshot-1200.jpg"
            alt="Profile Picture"
            height={PROFILE_SIZE}
            width={PROFILE_SIZE}
            priority={true}
            layout="responsive"
            viewportWidthMultiplier={0.5}
          />
        </Link>
        <div className={styles.mobileSpacer} aria-hidden="true" />
        <h1 className={styles.siteName}>
          <Link href="/" prefetch={prefetch}>
            {SITE_TITLE}
          </Link>
        </h1>
      </div>
      <div className={styles.row}>
        <div className={styles.spacer} aria-hidden="true" />
        <Link href="/about" className={styles.link}>
          About
        </Link>
        <Link href="/projects" className={styles.link}>
          Projects
        </Link>
        <Link href="/archive" className={styles.link}>
          Archive
        </Link>
        <Link href="/meet-reports" className={styles.link}>
          Meets
        </Link>
        <button
          type="button"
          className={`${styles.link} ${styles.searchButton}`}
          aria-label="Search"
          aria-keyshortcuts="Meta+K Control+K"
          title="Search (⌘K)"
          onClick={onOpenPalette}
          onMouseEnter={onPreloadPalette}
          onFocus={onPreloadPalette}
        >
          <SearchIcon width={22} height={22} />
          <kbd className={styles.kbd} aria-hidden="true">
            ⌘K
          </kbd>
        </button>
        <Twitter
          eventAction="header-cta-click"
          size={25}
          className={styles.link}
        />
      </div>
    </header>
  );
}
