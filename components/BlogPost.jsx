import Head from "next/head";
import React from "react";

import Header from "../components/Header";
import {
  RootContainer,
  MainContainer,
  TitleContainer,
} from "../components/containers";
import { getAllPosts } from "../lib/blogs";

export default function BlogPost({ post }) {
  const { title, date, slug, author, content } = post;

  return (
    <>
      <h2>{title}</h2>
      <em>{date}</em>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </>
  );
}
