import styled from "styled-components";

import { Colors, BASE_URL } from "../lib/constants";
import formatDate from "../lib/util/formatDate";
import { Twitter } from "./Icon";

const BylineWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: ${Colors.GRAY};

  svg {
    fill: ${Colors.GRAY};
  }

  > * {
    padding-right: 0.5em;
  }
`;

export default function Byline({ date, slug }) {
  const dateStr = formatDate(new Date(date));

  return (
    <BylineWrapper>
      <small>{dateStr}</small>
      <Twitter
        href={`https://www.twitter.com/share?url=${encodeURIComponent(
          `https://${BASE_URL}/posts/${slug}/`
        )}`}
        label="Tweet this post"
        eventLabel="post"
        circle={true}
        size={25}
      />
    </BylineWrapper>
  );
}
