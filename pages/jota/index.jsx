import React from "react";
import { getProjects } from "../../lib/blogs";
import BlogPost from "../../components/BlogPost";

export default function JOTA({ data }) {
  return <BlogPost post={data} opts={{ showDate: false, noLink: true }} />;
}

export async function getStaticProps() {
  const projects = await getProjects();

  return {
    props: {
      data: projects.filter(p => p.title === "JOTA")[0],
    },
  };
}
