import React, { useEffect } from "react";

import { useRouter } from "next/router";

import Title from "components/Title";

import blogStyles from "styles/components/Blog.module.scss";

import type { Metas } from "lib/types";

// The 200m-only converter this slug used to serve now lives at /lane-draw/,
// which covers the 400m and both sexes as well.
const TARGET = "/projects/track/lane-draw/";

export const metas: Metas = {
  title: "200m Lane Draw Converter",
  description: "Moved to the Lane Draw Converter.",
};

// keeps the slug out of the utilities index and the "Other Utilities" lists
export const hidden = true;

export default function Moved200mLaneDraw() {
  const router = useRouter();

  useEffect(() => {
    const existing = new URLSearchParams(window.location.search);
    const params = new URLSearchParams({ event: "200m", gender: "men" });
    for (const key of ["time", "currentLane", "targetLane"]) {
      const value = existing.get(key);
      if (value) {
        params.set(key, value);
      }
    }

    router.replace(`${TARGET}?${params.toString()}`);
  }, [router]);

  return (
    <article className={blogStyles.article}>
      <Title title={metas.title} />
      <p>
        This calculator moved to the <a href={TARGET}>Lane Draw Converter</a>,
        which also handles the 400m and women&apos;s races.
      </p>
    </article>
  );
}
