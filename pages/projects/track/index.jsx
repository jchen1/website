import Title from "components/Title";
import Link from "next/link";
import styles from "styles/components/Blog.module.scss";

export default function Index() {
  return (
    <article className={styles.article}>
      <Title title="Track Utilities" />
      <ul>
        <li>
          <Link href="/projects/track/points-calculator" passHref>
            <a>World Athletics Points Calculator</a>
          </Link>
        </li>
        <li>
          <Link href="/projects/track/wind-correction" passHref>
            <a>Wind Correction Calculator</a>
          </Link>
        </li>
      </ul>
    </article>
  );
}
