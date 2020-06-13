import React from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "localhost:4000";

export default function Header() {
  return (
    <div className="wrapper-masthead">
      <div className="container">
        <header className="masthead clearfix">
          <a href={`${BASE_URL}/`} className="site-avatar">
            <img src="https://jeffchen.dev/images/profile.jpg" />
          </a>

          <div className="site-info">
            <h1 className="site-name">
              <a href={`${BASE_URL}/`}>Jeff Chen</a>
            </h1>
            <p className="site-description">Engineering & more</p>
          </div>

          <nav>
            <a href={`${BASE_URL}/about/`}>About</a>
            <a href={`${BASE_URL}/projects/`}>Projects</a>
            <a href={`${BASE_URL}/resume/`}>Résumé</a>
          </nav>
        </header>
      </div>
    </div>
  );
}
