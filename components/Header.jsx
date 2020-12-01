import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "components/Image";

import { event } from "../lib/gtag";
import { SITE_TITLE, SITE_DESCRIPTION } from "../lib/constants";

import styles from "styles/components/Header.module.scss";

const PROFILE_SIZE = 80;

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
                src="/images/headshot-160.jpg"
                alt="Profile Picture"
                height={PROFILE_SIZE}
                width={PROFILE_SIZE}
                priority={true}
                loading="eager"
                layout="fixed"
              />
            </a>
          </Link>

          <div className={styles.siteInfo}>
            <h1 className={styles.siteName}>
              <Link href="/" prefetch={prefetch}>
                <a>{SITE_TITLE}</a>
              </Link>
            </h1>
            <p className={styles.description}>{SITE_DESCRIPTION}</p>
          </div>
        </div>
        <nav className={styles.nav}>
          <Link href="/archive">
            <a>Archive</a>
          </Link>
          <Link href="/about">
            <a>About</a>
          </Link>
          <Link href="/projects">
            <a>Projects</a>
          </Link>
          <a
            href="/resume/index.html"
            onClick={() =>
              event({
                action: "header-cta-click",
                label: "resume",
                category: "cta",
              })
            }
          >
            Résumé
          </a>
        </nav>
      </div>
    </header>
  );
}
