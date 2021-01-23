import { CONVERTKIT_FORMID } from "lib/constants";
import React from "react";

import styles from "styles/components/ConvertKit.module.scss";

export default function ConvertKit({ formId = CONVERTKIT_FORMID }) {
  const action = `https://app.convertkit.com/forms/${formId}/subscriptions`;
  return (
    <form action={action} target="_blank" method="post" className={styles.form}>
      <input
        type="email"
        name="email_address"
        placeholder="Type your email..."
        aria-label="Email"
        id="ck-email"
        className={styles.email}
      />
      <button type="submit" className={styles.submit}>
        Subscribe
      </button>
    </form>
  );
}
