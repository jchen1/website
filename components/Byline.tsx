import formatDate from "../lib/util/formatDate";

import styles from "styles/components/Byline.module.scss";

interface BylineProps {
  date?: string;
  slug?: string;
}

export default function Byline({ date }: BylineProps) {
  const dateStr = date ? formatDate(new Date(date)) : " ";

  return <small className={styles.byline}>{dateStr}</small>;
}
