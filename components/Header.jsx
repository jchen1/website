import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "components/Image";

import { Twitter } from "components/Icon";
import { SITE_TITLE } from "../lib/constants";

import styles from "styles/components/Header.module.scss";

const PROFILE_SIZE = 320;

export default function Header() {
  const router = useRouter();
  // prevent "auto-prefetch based on viewport... warning"
  const prefetch = router.pathname === "/" ? false : undefined;
  return (
    <header className={styles.header}>
      <nav className={styles.container}>
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
        <div className={styles.links}>
          <h1 className={styles.siteName}>
            <Link href="/" prefetch={prefetch}>
              <a>{SITE_TITLE}</a>
            </Link>
          </h1>
          <div className={styles.spacer} />
          <Link href="/about">
            <a className={styles.link}>About</a>
          </Link>
          <Link href="/projects">
            <a className={styles.link}>Projects</a>
          </Link>
          <Link href="/archive">
            <a className={styles.link}>Archive</a>
          </Link>
          <Twitter
            eventAction="header-cta-click"
            size={25}
            className={styles.link}
          />
        </div>
      </nav>
    </header>
  );
}
