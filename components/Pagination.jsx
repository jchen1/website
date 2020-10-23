import React from "react";
import styled from "styled-components";
import { Colors } from "../lib/constants";
import Link from "next/link";

// TODO - have "..." when pages.length > MAX_PAGES_TO_DISPLAY
const MAX_PAGES_TO_DISPLAY = 5;

const Container = styled.div`
  display: flex;
  padding: 2rem 0 0;
`;

const PageLink = styled.button`
  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
    border-right-width: 1px;
  }

  & > a {
    text-decoration: none;
  }

  &.current > a {
    font-weight: bold;
  }

  width: 2.5em;
  font-size: 18px;
  line-height: 2em;
  border: 1px solid ${Colors.LIGHT_GRAY};
  border-right-width: 0;

  background-color: unset;
`;

// pages is an array of { link, title, isCurrent }
export default function Pagination({ pages }) {
  const pageMarkup = pages?.map(page => {
    return (
      <PageLink key={page.link} className={page.isCurrent ? "current" : ""}>
        <Link href={page.link}>{page.title}</Link>
      </PageLink>
    );
  });

  return <Container>{pageMarkup}</Container>;
}
