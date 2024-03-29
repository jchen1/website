import React from "react";
import { useRouter } from "next/router";

import { event } from "../lib/gtag";

import styles from "styles/components/PostCTA.module.scss";
import ConvertKit from "./ConvertKit";
import { canonicalize } from "lib/util";

export default function PostCTA() {
  const router = useRouter();

  return (
    <div className={styles.wrapper}>
      <strong>
        Enjoyed this post?{" "}
        <a
          href="https://www.twitter.com/iambald"
          target="_blank"
          rel="noreferrer"
          onClick={() =>
            event({
              action: "post-cta-click",
              category: "cta",
              label: canonicalize(router),
            })
          }
        >
          Follow me on Twitter
        </a>{" "}
        for more content like this. Or, subscribe to my email newsletter to get
        new articles delivered straight to your inbox!
      </strong>
      <ConvertKit />
    </div>
  );
}
