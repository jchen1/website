import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { Colors } from "../lib/constants";

const Container = styled.ul`
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  margin: 15px 0 -5px;
`;

const TagItem = styled.li`
  display: inline;
  padding: 2px 8px;
  margin: 0 5px 5px 0;
  background-color: ${Colors.DARK_GRAY};
  border-radius: 5px;

  &:hover {
    background-color: ${Colors.RED};
    cursor: pointer;
  }

  a {
    color: ${Colors.WHITE};
    text-decoration: none;
  }
`;

// array of string tags
export default function Tags({ tags }) {
  const tagMarkup = tags?.sort().map(tag => {
    return (
      <TagItem>
        <Link href={`/tag/${tag}`} key={tag}>
          <a>
            <small>{tag}</small>
          </a>
        </Link>
      </TagItem>
    );
  });

  return <Container>{tagMarkup}</Container>;
}
