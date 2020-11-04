import styled from "styled-components";

import { event } from "../lib/gtag";
import { Colors } from "../lib/constants";

// https://jam-icons.com/
import EnvelopeIcon from "../assets/envelope-f.svg";
import GithubIcon from "../assets/github.svg";
import TwitterIcon from "../assets/twitter.svg";
import TwitterCircleIcon from "../assets/twitter-circle.svg";
import LinkedinIcon from "../assets/linkedin.svg";
import RSSIcon from "../assets/rss-feed.svg";

const ICON_SIZE = 30;

const Button = styled.a`
  display: inline-flex;

  > svg:hover {
    fill: ${Colors.RED};
  }
`;

function Icon({
  IconComponent,
  href,
  label,
  target,
  eventAction,
  eventLabel,
  className,
  rel,
  size,
}) {
  return (
    <Button
      href={href}
      aria-label={label}
      rel={rel || ""}
      target={target || "_self"}
      className={className}
    >
      <IconComponent
        width={size || ICON_SIZE}
        height={size || ICON_SIZE}
        onClick={() => event({ action: eventAction, label: eventLabel })}
      />
    </Button>
  );
}

export function Envelope(props) {
  return (
    <Icon
      {...{
        eventAction: "email",
        href: "mailto:hello@jeff.yt",
        label: "Send me an email!",
        IconComponent: EnvelopeIcon,
        ...props,
      }}
    />
  );
}

export function Github(props) {
  return (
    <Icon
      {...{
        eventAction: "github",
        href: "https://github.com/jchen1",
        label: "@jchen1 on GitHub",
        rel: "noopener",
        IconComponent: GithubIcon,
        target: "_blank",
        ...props,
      }}
    />
  );
}

export function Twitter(props) {
  return (
    <Icon
      {...{
        eventAction: "twitter",
        href: "https://www.twitter.com/iambald",
        label: "@iambald on Twitter",
        rel: "noopener",
        IconComponent: props.circle ? TwitterCircleIcon : TwitterIcon,
        target: "_blank",
        ...props,
      }}
    />
  );
}

export function Linkedin(props) {
  return (
    <Icon
      {...{
        eventAction: "linkedin",
        href: "https://www.linkedin.com/in/jchen94",
        label: "LinkedIn",
        rel: "noopener",
        IconComponent: LinkedinIcon,
        target: "_blank",
        ...props,
      }}
    />
  );
}

export function RSS(props) {
  return (
    <Icon
      {...{
        eventAction: "rss",
        href: "/rss-feed.xml",
        label: "Subscribe via RSS",
        IconComponent: RSSIcon,
        ...props,
      }}
    />
  );
}
