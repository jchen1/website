import Archive from "./archive";
import { ARCHIVE_FIELDS, getAllMeetReports } from "../lib/blogs";

export default Archive;

export async function getStaticProps({ params }) {
  const posts = getAllMeetReports(ARCHIVE_FIELDS);

  return {
    props: {
      posts,
      title: "Meet Reports",
      prefix: "meet-reports",
    },
  };
}
