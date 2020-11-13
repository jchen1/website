import React from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

import { event } from "../lib/gtag";
import { Colors, SITE_TITLE, SITE_DESCRIPTION } from "../lib/constants";
import { useRouter } from "next/router";

const PROFILE_SIZE = 80;

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
    color: ${Colors.DARK_GRAY};
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
  color: ${Colors.GRAY};
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
  color: ${Colors.DARK_GRAY};
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
                src="/images/profile.jpg"
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
            onClick={() => event({ action: "resume", label: "header" })}
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
