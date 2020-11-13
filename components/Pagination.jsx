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

const PageLink = styled.a`
  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
    border-right-width: 1px;
  }

  &.current {
    font-weight: bold;
  }

  &:hover {
    color: ${Colors.RED};
    cursor: pointer;
  }

  width: 2.5em;
  font-size: 18px;
  line-height: 2em;
  border: 1px solid ${Colors.LIGHT_GRAY};
  border-right-width: 0;
  text-align: center;
  text-decoration: none;

  background-color: unset;
`;

// pages is an array of { link, title, isCurrent }
export default function Pagination({ pages }) {
  const pageMarkup = pages?.map(page => {
    return (
      <Link key={page.link} href={page.link}>
        <PageLink className={page.isCurrent ? "current" : ""}>
          {page.title}
        </PageLink>
      </Link>
    );
  });

  return <Container>{pageMarkup}</Container>;
}
