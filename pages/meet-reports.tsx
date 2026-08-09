import type { GetStaticProps } from "next";

import Archive from "./archive";
import type { ArchiveProps } from "./archive";
import { ARCHIVE_FIELDS, getAllMeetReports } from "../lib/blogs";

export default Archive;

export const getStaticProps: GetStaticProps<ArchiveProps> = async () => {
  const posts = getAllMeetReports(ARCHIVE_FIELDS).map(
    ({ tags: _tags, draft: _draft, ...post }) => post,
  );

  return {
    props: {
      posts,
      title: "Meet Reports",
      prefix: "meet-reports",
    },
  };
};
