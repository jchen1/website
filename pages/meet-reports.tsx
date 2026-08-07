import type { GetStaticProps } from "next";

import Archive from "./archive";
import type { ArchiveProps } from "./archive";
import { ARCHIVE_FIELDS, getAllMeetReports } from "../lib/blogs";

export default Archive;

export const getStaticProps: GetStaticProps<ArchiveProps> = async () => {
  const posts = getAllMeetReports(ARCHIVE_FIELDS);

  return {
    props: {
      posts,
      title: "Meet Reports",
      prefix: "meet-reports",
    },
  };
};
