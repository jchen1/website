import React from "react";
import { getProjects } from "../lib/blogs";
import BlogPost from "../components/BlogPost";
import Meta from "../components/Meta";

export default function Projects({ projects }) {
  const metas = {
    title: "Projects",
    description: "Projects",
    "og:type": "article",
  };
  return (
    <>
      <Meta {...metas} />
      <h1 className="title">Projects</h1>
      {projects.map(project => (
        <BlogPost
          key={project.title}
          post={project}
          opts={{
            showDate: false,
            setTitle: false,
            headingLevel: 2,
            titleClass: "highlight",
          }}
        />
      ))}
    </>
  );
}

export async function getStaticProps() {
  const projects = await getProjects();

  return {
    props: {
      projects,
    },
  };
}
