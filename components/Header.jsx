import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "components/Image";

import { Twitter } from "components/Icon";
import { SITE_TITLE, SITE_DESCRIPTION } from "../lib/constants";

import styles from "styles/components/Header.module.scss";

const PROFILE_SIZE = 1200;

export default function Header() {
  const router = useRouter();
  // prevent "auto-prefetch based on viewport... warning"
  const prefetch = router.pathname === "/" ? false : undefined;
  return (
    <header className={styles.masthead}>
      <div className={styles.container}>
        <div className={styles.headerLeft}>
          <Link href="/" prefetch={prefetch}>
            <a className={styles.siteAvatar} aria-label="Home">
              <Image
                src="/images/headshot-1200.jpg"
                alt="Profile Picture"
                height={PROFILE_SIZE}
                width={PROFILE_SIZE}
                priority={true}
                layout="responsive"
              />
            </a>
          </Link>

          <div className={styles.siteInfo}>
            <h1 className={[styles.siteName, styles.desktopSiteName].join(" ")}>
              <Link href="/" prefetch={prefetch}>
                <a>{SITE_TITLE}</a>
              </Link>
            </h1>
            <p className={styles.description}>{SITE_DESCRIPTION}</p>
          </div>
        </div>
        <nav className={styles.nav}>
          <h1 className={[styles.siteName, styles.mobileSiteName].join(" ")}>
            <Link href="/" prefetch={prefetch}>
              <a>{SITE_TITLE}</a>
            </Link>
          </h1>
          <Link href="/about">
            <a>About</a>
          </Link>
          <Link href="/projects">
            <a>Projects</a>
          </Link>
          <Link href="/archive">
            <a>Archive</a>
          </Link>
          <Twitter
            eventAction="header-cta-click"
            size={25}
            className={styles.twitter}
          />
        </nav>
      </div>
    </header>
  );
}
