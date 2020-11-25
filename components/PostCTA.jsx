import React from "react";
import { useRouter } from "next/router";

import { event } from "../lib/gtag";

import styles from "styles/components/PostCTA.module.scss";

export default function PostCTA() {
  const router = useRouter();

  return (
    <strong className={styles.wrapper}>
      Enjoyed this post?{" "}
      <a
        href="https://www.twitter.com/iambald"
        target="_blank"
        onClick={() =>
          event({
            action: "post-cta-click",
            category: "cta",
            label: router.asPath,
          })
        }
      >
        Follow me on Twitter
      </a>{" "}
      for more content like this!
    </strong>
  );
}
