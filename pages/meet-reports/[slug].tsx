import { useRouter } from "next/router";
import ErrorPage from "next/error";
import type { GetStaticPaths, GetStaticProps } from "next";

import {
  markdownToHtml,
  getPostBySlug,
  getAllPosts,
  getRelatedPosts,
  POST_FIELDS,
  ARCHIVE_FIELDS,
  getMeetReportBySlug,
  getAllMeetReports,
} from "lib/blogs";

import BlogPost from "components/BlogPost";
import { sizeImage } from "../../lib/util/server";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

// Dimensions of the report's hero image, or `{}` when the report has no hero
// image or its dimensions could not be read.
type HeroImageSize = Partial<NonNullable<ReturnType<typeof sizeImage>>>;

interface PostProps {
  post: MarkdownItem & MarkdownHtml & { heroImageSize: HeroImageSize };
  relatedPosts: MarkdownItem[];
}

export default function Post({ post, relatedPosts }: PostProps) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <BlogPost
      post={post}
      opts={{ showScroll: true, preloadHero: true }}
      relatedPosts={relatedPosts}
    />
  );
}

export const getStaticProps: GetStaticProps<
  PostProps,
  { slug: string }
> = async ({ params }) => {
  const post = getMeetReportBySlug(params!.slug, POST_FIELDS);
  const content = await markdownToHtml(post.content || "");

  const heroImageSize = (function (): HeroImageSize {
    if (post.heroImage) {
      return sizeImage(post.heroImage, { basepath: "public" }) || {};
    }
    return {};
  })();

  const relatedPosts = getRelatedPosts(post, ARCHIVE_FIELDS);

  return {
    props: {
      post: {
        ...post,
        ...content,
        heroImageSize,
      },
      relatedPosts,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllMeetReports(["slug"]);

  return {
    paths: posts.map(post => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
};
