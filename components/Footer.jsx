import React from "react";

import { Envelope, Github, Twitter, Linkedin, RSS } from "../components/Icon";

import styles from "styles/components/Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.container}>
      <button className={styles.button}>
        <Envelope eventAction="footer-cta-click" />
      </button>
      <button className={styles.button}>
        <Github eventAction="footer-cta-click" />
      </button>
      <button className={styles.button}>
        <Twitter eventAction="footer-cta-click" />
      </button>
      <button className={styles.button}>
        <Linkedin eventAction="footer-cta-click" />
      </button>
      <button className={styles.button}>
        <RSS eventAction="footer-cta-click" />
      </button>
    </footer>
  );
}
