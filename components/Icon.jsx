import { event } from "../lib/gtag";

// https://jam-icons.com/
import EnvelopeIcon from "../assets/envelope-f.svg";
import GithubIcon from "../assets/github.svg";
import TwitterIcon from "../assets/twitter.svg";
import TwitterCircleIcon from "../assets/twitter-circle.svg";
import LinkedinIcon from "../assets/linkedin.svg";
import RSSIcon from "../assets/rss-feed.svg";

import styles from "styles/components/Icon.module.scss";

const ICON_SIZE = 30;

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
}) {
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

export function Envelope(props) {
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

export function Github(props) {
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

export function Twitter(props) {
  return (
    <Icon
      {...{
        eventLabel: "twitter",
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

export function RSS(props) {
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
