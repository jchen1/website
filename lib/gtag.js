import { track } from '@minimal-analytics/ga4';

export const GA_TRACKING_ID = "UA-135975758-1";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = url => {
  track(GA_TRACKING_ID, { event: { page_path: url} })
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  track(GA_TRACKING_ID, { type: action, event: {
    event_category: category,
    event_label: label,
    value
  }});
};
