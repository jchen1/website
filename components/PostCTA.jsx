import React from "react";
import { useRouter } from "next/router";
import styled from "styled-components";

import { event } from "../lib/gtag";

const Wrapper = styled.strong`
  padding-top: 2rem;

  @media screen and (min-width: 640px) {
    padding-top: 4rem;
  }
`;

export default function PostCTA() {
  const router = useRouter();

  return (
    <Wrapper>
      Enjoyed this post?{" "}
      <a
        href="https://www.twitter.com/iambald"
        target="_blank"
        onClick={() =>
          event({
            action: "post-cta-click",
            category: "cta",
            label: router.asPath,
          })
        }
      >
        Follow me on Twitter
      </a>{" "}
      for more content like this!
    </Wrapper>
  );
}
