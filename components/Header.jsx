import React from "react";
import Link from "next/link";
import styled from "styled-components";
import { Colors, SITE_TITLE } from "../lib/constants";

const HeaderContainer = styled.header`
  padding: 20px 0;
  max-width: 740px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;

  @media screen and (max-width: 640px) {
    text-align: center;
    flex-direction: column;
  }
`;

const Masthead = styled.div`
  margin-bottom: 50px;
  width: 100%;
  max-width: 1400px;
  border-bottom: 1px solid ${Colors.LIGHT_GRAY};
`;

const Nav = styled.nav`
  font-size: 18px;

  @media screen and (max-width: 640px) {
    margin-top: 9px;
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

const Description = styled.p`
  margin: -5px 0 0 0;
  color: ${Colors.GRAY};
  font-size: 16px;

  @media screen and (max-width: 640px) {
    margin: 3px 0;
  }
`;

const SiteInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SiteName = styled.h1`
  color: ${Colors.DARK_GRAY};
  margin: 0;

  @media screen and (max-width: 640px) {
    margin-top: 6px;
  }
`;

const SiteAvatar = styled.img`
  height: 70px;
  width: 70px;
  margin-right: 15px;

  @media screen and (max-width: 640px) {
    margin: 0 auto;
  }

  border-radius: 100%;
`;

const HeaderLeft = styled.div`
  display: flex;

  @media screen and (max-width: 640px) {
    flex-direction: column;
  }
`;

export default function Header() {
  return (
    <Masthead>
      <HeaderContainer>
        <HeaderLeft>
          <Link href="/">
            <a aria-label="Home">
              <SiteAvatar src="/images/profile.jpg" alt="Profile Picture" />
            </a>
          </Link>

          <SiteInfo>
            <SiteName>
              <Link href="/">
                <a>{SITE_TITLE}</a>
              </Link>
            </SiteName>
            <Description>Code &amp; fitness</Description>
          </SiteInfo>
        </HeaderLeft>
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
    </Masthead>
  );
}
