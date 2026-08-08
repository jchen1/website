import React from "react";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import type { GetStaticPaths, GetStaticProps } from "next";

import { ARCHIVE_FIELDS, getAllPosts, getPostsByTag } from "lib/blogs";

import { ArchiveItem } from "../archive";
import type { ArchivePost } from "../archive";

interface TagPageProps {
  posts: ArchivePost[];
  tag: string;
}

export default function IndexPage(props: TagPageProps) {
  const { posts, tag } = props;
  const router = useRouter();
  if (!router.isFallback && !posts) {
    return <ErrorPage statusCode={404} />;
  }

  const postMarkup = posts.map((post, idx) => (
    <ArchiveItem {...post} key={post.slug} />
  ));

  return (
    <>
      <h1 className="title">Posts tagged &quot;{tag}&quot;</h1>
      {postMarkup}
    </>
  );
}

export const getStaticProps: GetStaticProps<
  TagPageProps,
  { tag: string }
> = async ({ params }) => {
  const tag = params!.tag;
  const posts = getPostsByTag(tag, ARCHIVE_FIELDS).map(
    ({ tags: _tags, draft: _draft, ...post }) => post,
  );

  return {
    props: {
      posts,
      tag,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const tags = [
    ...new Set(
      getAllPosts(["tags"])
        .map(p => p.tags!)
        .map(taglist => taglist.split(","))
        .flat(),
    ),
  ];
  return {
    paths: tags.map(tag => {
      return {
        params: { tag },
      };
    }),
    fallback: false,
  };
};
