import { event } from "../lib/gtag";

// https://jam-icons.com/
import EnvelopeIcon from "../assets/envelope-f.svg";
import GithubIcon from "../assets/github.svg";
import TwitterIcon from "../assets/twitter.svg";
import LinkedinIcon from "../assets/linkedin.svg";
import RSSIcon from "../assets/rss-feed.svg";

import styles from "styles/components/Icon.module.scss";

import type { FunctionComponent, SVGProps } from "react";

const ICON_SIZE = 30;

// Props every exported icon accepts; each icon supplies its own destination,
// label and svg, and callers override the analytics event and presentation.
export interface IconProps {
  href?: string;
  label?: string;
  target?: string;
  eventAction?: string;
  eventCategory?: string;
  eventLabel?: string;
  className?: string;
  rel?: string;
  size?: number;
}

interface InternalIconProps extends IconProps {
  IconComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
}

function Icon({
  IconComponent,
  href,
  label,
  target,
  eventAction,
  eventCategory,
  eventLabel,
  className,
  rel,
  size,
}: InternalIconProps) {
  return (
    <a
      href={href}
      aria-label={label}
      rel={rel || ""}
      target={target || "_self"}
      className={`${className} ${styles.button}`}
    >
      <IconComponent
        width={size || ICON_SIZE}
        height={size || ICON_SIZE}
        onClick={() =>
          event({
            action: eventAction || "click",
            label: eventLabel,
            category: eventCategory || "cta",
          })
        }
      />
    </a>
  );
}

export function Envelope(props: IconProps) {
  return (
    <Icon
      {...{
        eventLabel: "email",
        href: "mailto:hello@jeff.yt",
        label: "Send me an email!",
        IconComponent: EnvelopeIcon,
        ...props,
      }}
    />
  );
}

export function Github(props: IconProps) {
  return (
    <Icon
      {...{
        eventLabel: "github",
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

export function Twitter(props: IconProps) {
  return (
    <Icon
      {...{
        eventLabel: "twitter",
        href: "https://www.twitter.com/iambald",
        label: "@iambald on Twitter",
        rel: "noopener",
        IconComponent: TwitterIcon,
        target: "_blank",
        ...props,
      }}
    />
  );
}

export function Linkedin(props: IconProps) {
  return (
    <Icon
      {...{
        eventLabel: "linkedin",
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

export function RSS(props: IconProps) {
  return (
    <Icon
      {...{
        eventLabel: "rss",
        href: "/rss-feed.xml",
        label: "Subscribe via RSS",
        IconComponent: RSSIcon,
        ...props,
      }}
    />
  );
}
