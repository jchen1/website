import { BASE_URL } from "../lib/constants";
import formatDate from "../lib/util/formatDate";
import { Twitter } from "./Icon";

import styles from "styles/components/Byline.module.scss";

export default function Byline({ date, slug }) {
  const dateStr = formatDate(new Date(date));

  return (
    <div className={styles.byline}>
      <small>{dateStr}</small>
      <Twitter
        href={`https://www.twitter.com/share?url=${encodeURIComponent(
          `https://${BASE_URL}/posts/${slug}/`
        )}`}
        label="Tweet this post"
        eventLabel="post"
        circle={true}
        size={25}
      />
    </div>
  );
}
