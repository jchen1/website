import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { SITE_TITLE } from "lib/constants";

import Image from "components/Image";
import { Twitter } from "components/Icon";

import styles from "styles/components/Header.module.scss";

const PROFILE_SIZE = 320;

export default function Header() {
  const router = useRouter();
  // prevent "auto-prefetch based on viewport... warning"
  const prefetch = router.pathname === "/" ? false : undefined;
  return (
    <header className={styles.container}>
      <Link href="/" prefetch={prefetch}>
        <a className={styles.siteAvatar} aria-label="Home">
          <Image
            src="/images/headshot-1200.jpg"
            alt="Profile Picture"
            height={PROFILE_SIZE}
            width={PROFILE_SIZE}
            priority={true}
            layout="responsive"
            viewportWidthMultiplier={0.5}
          />
        </a>
      </Link>
      <nav className={styles.links}>
        <h1 className={styles.siteName}>
          <Link href="/" prefetch={prefetch}>
            <a>{SITE_TITLE}</a>
          </Link>
        </h1>
        <div className={styles.spacer} aria-hidden />
        <Link href="/about">
          <a className={styles.link}>About</a>
        </Link>
        <Link href="/projects">
          <a className={styles.link}>Projects</a>
        </Link>
        <Link href="/archive">
          <a className={styles.link}>Archive</a>
        </Link>
        <Link href="/meet-reports">
          <a className={styles.link}>Meet Reports</a>
        </Link>
        <Twitter
          eventAction="header-cta-click"
          size={25}
          className={styles.link}
        />
      </nav>
    </header>
  );
}
