import React from "react";
import MainContainer from "../../components/containers/MainContainer";
import { getProjects } from "../../lib/blogs";
import BlogPost from "../../components/BlogPost";

export default function JOTA({ data }) {
  return (
    <MainContainer>
      <BlogPost post={data} opts={{ showDate: false, noLink: true }} />
    </MainContainer>
  );
}

export async function getStaticProps() {
  const projects = await getProjects();

  return {
    props: {
      data: projects.filter(p => p.title === "JOTA")[0],
    },
  };
}
