import clsx from "clsx";
import React, { useRef, useEffect } from "react";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import TypeIt from "typeit-react";
import GitHubButton from "react-github-btn";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  const switchTheme = (theme) => {
    const root = document.documentElement;

    if (theme === "style1") {
      root.style.setProperty("--hero-bg-color", "#1b1b1b");
      root.style.setProperty("--hero-text-color", "#ffffff");
      root.style.setProperty("--about-site-bg-color", "#25c2a0");
      root.style.setProperty("--about-site-text-color", "#000000");
    } else if (theme === "style2") {
      root.style.setProperty("--hero-bg-color", "#25c2a0");
      root.style.setProperty("--hero-text-color", "#000000");
      root.style.setProperty("--about-site-bg-color", "#1b1b1b");
      root.style.setProperty("--about-site-text-color", "#ffffff");
    }
  };

  switchTheme("style1");

  return (
    <div>
      <HeroSection />
    </div>
  );
}

function HeroSection() {
  const { siteConfig = {} } = useDocusaurusContext();

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <img
          alt={siteConfig.title}
          className={clsx(styles.heroBannerLogo, "margin-vert--md")}
          src="img/logo.svg"
        />
        <p className="hero__subtitle">
          <TypeIt
            options={{
              strings: [siteConfig.tagline],
              afterComplete: (instance) => {
                console.log("Completed!");
                instance.pause(1000).destroy();
              },
              speed: 50,
            }}
          ></TypeIt>
        </p>
        <div className={styles.buttonContainer}>
          {" "}
          {/* Updated container for buttons */}
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Notes 📒
          </Link>
          <Link className="button button--secondary button--lg" to="/blog">
            {" "}
            {/* New button added */}
            Blog 👩‍💻
          </Link>
        </div>
        <p className="margin-top--md">
          <em>
            <TypeIt
              options={{
                afterComplete: (instance) => {
                  console.log("Completed!");
                  instance.pause(1000).destroy();
                },
                speed: 50,
              }}
              getBeforeInit={(instance) => {
                //sleep for 10 seconds before typing
                instance.pause(8000).type("Feel free to explore! 🚀");

                // Remember to return it!
                return instance;
              }}
            />
          </em>
        </p>
        <GitHubButton
          href="https://github.com/Simons36/docusaurus-site"
          data-color-scheme="no-preference: dark; light: light; dark: light;"
          data-size="large"
          aria-label="Star Simons36/docusaurus-site on GitHub"
        >
          Star
        </GitHubButton>
      </div>
    </header>
  );
}

function AboutSiteSection() {
  const { siteConfig = {} } = useDocusaurusContext();

  return (
    <section className={clsx("about-site", styles.aboutSiteSection)}>
      <div className="container">
        {/* Flexbox container for two columns */}
        <div className={styles.aboutSiteRow}>
          {/* Left Column */}
          <div className={styles.aboutSiteColumn}>
            <img
              src="img/notes_icon.svg" // Path to your SVG image for Notes
              alt="Notes Icon"
              className={styles.aboutSiteIcon}
            />
            <h3 className={styles.aboutSiteTitle}>Notes</h3>
            <p className={styles.aboutSiteDescription}>
              Discover a collection of notes, elaborated while studying for the
              classes I took in my Computer Science and Engineering degree at{" "}
              <a href="https://tecnico.ulisboa.pt/en/">
                Instituto Superior Técnico (IST)
              </a>
              . Some of the subjects are:
            </p>
            {/* All buttons in one column */}
            <div className={styles.buttonColumn}>
              <Link
                className={clsx(
                  "button button--secondary",
                  styles.topicButton,
                  styles["topicButton--networks"]
                )}
                to="docs/Computer Networks/overview"
              >
                Computer Networks
              </Link>
              <Link
                className={clsx(
                  "button button--secondary",
                  styles.topicButton,
                  styles["topicButton--systems"]
                )}
                to="docs/Information Systems/overview"
              >
                Information Systems
              </Link>
              <Link
                className={clsx(
                  "button button--secondary",
                  styles.topicButton,
                  styles["topicButton--os"]
                )}
                to="docs/Operating Systems/overview"
              >
                Operating Systems
              </Link>
              <Link
                className={clsx(
                  "button button--secondary",
                  styles.topicButton,
                  styles["topicButton--cyber"]
                )}
                to="docs/overview"
              >
                Cybersecurity
              </Link>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.aboutSiteColumn}>
            <img
              src="img/blog_icon.svg" // Path to your SVG image for Blog
              alt="Blog Icon"
              className={styles.aboutSiteIcon}
            />
            <h3 className={styles.aboutSiteTitle}>Blog</h3>
            <p className={styles.aboutSiteDescription}>
              In the blog section, I will write about more pratical aspects of
              Computer Science, such as tutorials, how to use a certain
              technology (e.g. Docker), etc.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutMeSection() {
  return (
    <section className={clsx("about-me", styles.aboutMeSection)}>
      <div className="container">
        <div className={styles.aboutMeRow}>
          {/* Left Column: Image */}
          <div className={styles.aboutMeColumn}>
            <img
              src="img/me.jpg" // Placeholder image, replace with your image later
              alt="Profile"
              className={styles.aboutMeImage}
            />
          </div>

          {/* Right Column: Text */}
          <div className={styles.aboutMeColumn}>
            <h2 className={styles.aboutMeTitle}>About Me</h2>
            <p className={styles.aboutMeDescription}>
              My name is Simão Silva, and I'm a passionate soon-to-be software
              engineer with a deep interest in Computer Science. As a way of
              studying for my exams, I started writing markdown notes, and I
              have now decided to share this knowledge through this website.
            </p>
            <p className={styles.aboutMeDescription}>
              Feel free to visit the links below to learn more!
            </p>

            {/* Custom bullet points section */}
            <div className={styles.customLinks}>
              <div className={styles.customLink}>
                <img
                  src="img/person-icon.svg"
                  alt="Website Icon"
                  className={styles.customLinkIcon}
                />
                <a
                  href="https://simaosilva.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Personal Website
                </a>
              </div>
              <div className={styles.customLink}>
                <img
                  src="img/cv-icon.svg"
                  alt="CV Icon"
                  className={styles.customLinkIcon}
                />
                <a
                  href="https://cv.simaosilva.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CV
                </a>
              </div>
              <div className={styles.customLink}>
                <img
                  src="img/github-icon.svg"
                  alt="GitHub Icon"
                  className={styles.customLinkIcon}
                />
                <a
                  href="https://github.com/Simons36"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </div>
            </div>

            <p className={styles.aboutMeDescription}>
              If you wish to contribute, or spot any mistake, please free to do
              so:
            </p>
            <GitHubButton
              href="https://github.com/Simons36/docusaurus-site/fork"
              data-color-scheme="no-preference: dark; light: light; dark: light;"
              data-size="large"
              aria-label="Fork Simons36/docusaurus-site on GitHub"
            >
              Fork
            </GitHubButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <HomepageHeader />
      <main>
        <AboutSiteSection /> {/* New AboutSiteSection added here */}
        <AboutMeSection /> {/* New AboutMeSection added here */}
      </main>
    </Layout>
  );
}
