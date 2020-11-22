import React from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import { event } from "../lib/gtag";
import { Colors, SITE_TITLE, SITE_DESCRIPTION } from "../lib/constants";
import { useRouter } from "next/router";

const PROFILE_SIZE = 80;
const HEADER_COLOR = Colors.DARKER_GRAY;
const HEADER_TEXT_COLOR = Colors.WHITE;
const DESCRIPTION_TEXT_COLOR = Colors.WHITE;

const HeaderContainer = styled.div`
  padding: 30px 0;
  max-width: min(100%, 45rem);

  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;

  @media screen and (max-width: 640px) {
    text-align: center;
    flex-direction: column;
    padding: 15px 0 30px;
  }
`;

const Masthead = styled.header`
  width: 100%;
  margin: 0 auto 50px;

  background-color: ${HEADER_COLOR};

  @media screen and (max-width: 640px) {
    margin-bottom: 25px;
  }
`;

const Nav = styled.nav`
  @media screen and (max-width: 640px) {
    margin-top: 9px;
    font-size: 16px;
  }

  a {
    margin-left: 20px;
    color: ${HEADER_TEXT_COLOR};
    text-align: right;
    font-weight: 700;
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
  color: ${DESCRIPTION_TEXT_COLOR};
  font-size: 16px;

  @media screen and (max-width: 640px) {
    display: none;
  }
`;

const SiteInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SiteName = styled.h1`
  color: ${HEADER_TEXT_COLOR};
  margin: 0;

  @media screen and (max-width: 640px) {
    margin-top: 6px;
  }
`;

const SiteAvatar = styled.a`
  height: ${PROFILE_SIZE}px;
  width: ${PROFILE_SIZE}px;
  margin-right: 15px;

  @media screen and (max-width: 640px) {
    margin: 0 auto;
  }

  img {
    border-radius: 100%;
  }
`;

const HeaderLeft = styled.div`
  display: flex;

  @media screen and (max-width: 640px) {
    flex-direction: column;
  }
`;

export default function Header() {
  const router = useRouter();
  // prevent "auto-prefetch based on viewport... warning"
  const prefetch = router.pathname === "/" ? false : undefined;
  return (
    <Masthead>
      <HeaderContainer>
        <HeaderLeft>
          <Link href="/" prefetch={prefetch}>
            <SiteAvatar aria-label="Home">
              <Image
                src="/images/headshot-80.jpg"
                alt="Profile Picture"
                height={PROFILE_SIZE}
                width={PROFILE_SIZE}
                priority={true}
                loading="eager"
                layout="fixed"
              />
            </SiteAvatar>
          </Link>

          <SiteInfo>
            <SiteName>
              <Link href="/" prefetch={prefetch}>
                <a>{SITE_TITLE}</a>
              </Link>
            </SiteName>
            <Description>{SITE_DESCRIPTION}</Description>
          </SiteInfo>
        </HeaderLeft>
        <Nav>
          <Link href="/about">
            <a>About</a>
          </Link>
          <Link href="/projects">
            <a>Projects</a>
          </Link>
          <a
            href="/resume/index.html"
            onClick={() =>
              event({
                action: "header-cta-click",
                label: "resume",
                category: "cta",
              })
            }
          >
            Résumé
          </a>
          <Link href="/metrics">
            <a>Metrics</a>
          </Link>
        </Nav>
      </HeaderContainer>
    </Masthead>
  );
}
