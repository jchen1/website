import React from "react";
import { MainContainer } from "../components/containers";
import { getProjects } from "../lib/blogs";
import BlogPost from "../components/BlogPost";
import styled from "styled-components";
import Meta from "../components/Meta";

const Title = styled.div`
  width: min(45rem, 100%);
  text-align: left;

  > h1 {
    margin-top: 0;
  }
`;

export default function Projects({ projects }) {
  const metas = {
    title: "Projects",
    description: "Projects",
    "og:type": "article",
  };
  return (
    <MainContainer>
      <Meta {...metas} />

      <Title>
        <h1>Projects</h1>
      </Title>
      {projects.map(project => (
        <BlogPost
          key={project.title}
          post={project}
          opts={{ showDate: false, setTitle: false, headingLevel: 2 }}
        />
      ))}
    </MainContainer>
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
