import React from "react";
import { MainContainer } from "../components/containers";
import Head from "next/head";
import { getProjects } from "../lib/blogs";
import BlogPost from "../components/BlogPost";
import styled from "styled-components";

const Title = styled.h1`
  max-width: 740px;
  text-align: left;
  width: 100%;
`;

export default function Projects({ projects }) {
  return (
    <MainContainer>
      <Head>
        <title key="title">Projects</title>
      </Head>
      <Title>Projects</Title>
      {projects.map(project => (
        <BlogPost
          key={project.title}
          post={project}
          opts={{ showDate: false, setTitle: false, headingLevel: 2 }}
        ></BlogPost>
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
