import React from "react";
import { useRouter } from "next/router";
import ErrorPage from "next/error";

import { ARCHIVE_FIELDS, getAllPosts, getPostsByTag } from "lib/blogs";

import { ArchiveItem } from "../archive";

export default function IndexPage(props) {
  const { posts, tag } = props;
  const router = useRouter();
  if (!router.isFallback && !posts) {
    return <ErrorPage statusCode={404} />;
  }

  const postMarkup = posts.map((post, idx) => <ArchiveItem {...post} key={post.slug} />);

  return (
    <>
      <h1 className="title">Posts tagged &quot;{tag}&quot;</h1>
      {postMarkup}
    </>
  );
}

export async function getStaticProps({ params }) {
  const tag = params.tag;
  const posts = getPostsByTag(tag, ARCHIVE_FIELDS);

  return {
    props: {
      posts,
      tag,
    },
  };
}

export async function getStaticPaths() {
  const tags = [
    ...new Set(
      getAllPosts(["tags"])
        .map(p => p.tags)
        .map(taglist => taglist.split(","))
        .flat()
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
}
