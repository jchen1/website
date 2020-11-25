import React from "react";

import { Envelope, Github, Twitter, Linkedin, RSS } from "../components/Icon";

import styles from "styles/components/Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.container}>
      <div className={styles.button}>
        <Envelope eventAction="footer-cta-click" />
      </div>
      <div className={styles.button}>
        <Github eventAction="footer-cta-click" />
      </div>
      <div className={styles.button}>
        <Twitter eventAction="footer-cta-click" />
      </div>
      <div className={styles.button}>
        <Linkedin eventAction="footer-cta-click" />
      </div>
      <div className={styles.button}>
        <RSS eventAction="footer-cta-click" />
      </div>
    </footer>
  );
}
