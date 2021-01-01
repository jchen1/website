import formatDate from "../lib/util/formatDate";

import styles from "styles/components/Byline.module.scss";

export default function Byline({ date }) {
  const dateStr = date ? formatDate(new Date(date)) : " ";

  return <small className={styles.byline}>{dateStr}</small>;
}
