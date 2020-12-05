import formatDate from "../lib/util/formatDate";

import styles from "styles/components/Byline.module.scss";

export default function Byline({ date, slug }) {
  const dateStr = formatDate(new Date(date));

  return (
    <div className={styles.byline}>
      <small>{dateStr}</small>
    </div>
  );
}
