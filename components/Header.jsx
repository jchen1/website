import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Colors } from "../lib/constants";

const HeaderContainer = styled.header`
  padding: 20px 0;
  max-width: 740px;

  @media screen and (max-width: 640px) {
    text-align: center;
  }
`;

const Nav = styled.nav`
  float: right;
  margin-top: 23px;
  font-size: 18px;

  @media screen and (max-width: 640px) {
    float: none;
    margin-top: 9px;
    display: block;
    font-size: 16px;
  }

  a {
    margin-left: 20px;
    color: ${Colors.DARK_GRAY};
    text-align: right;
    font-weight: 600;
    text-decoration: none;

    @media screen and (max-width: 640px) {
      margin: 0 10px;
    }

    &:hover,
    &:active {
      color: ${Colors.RED};
    }
  }
`;

export default function Header() {
  return (
    <div className="wrapper-masthead">
      <div className="container">
        <HeaderContainer className="clearfix">
          <Link href="/">
            <a className="site-avatar">
              <img src="/images/profile.jpg" />
            </a>
          </Link>

          <div className="site-info">
            <h1 className="site-name">
              <Link href="/">
                <a>Jeff Chen</a>
              </Link>
            </h1>
            <p className="site-description">Code &amp; fitness</p>
          </div>

          <Nav>
            <Link href="/about">
              <a>About</a>
            </Link>
            <Link href="/projects">
              <a>Projects</a>
            </Link>
            <a href="/resume/index.html">Résumé</a>
            <Link href="/metrics">
              <a>Metrics</a>
            </Link>
          </Nav>
        </HeaderContainer>
      </div>
    </div>
  );
}
