import React from "react";
import styles from "../styles/PageHeader.module.css";

/** Mesmo glyph do icon_url em public/index.html (navbar WlExtension). */
const NavbarDashboardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={30}
    height={30}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <line x1="9" y1="17" x2="9" y2="12" />
    <line x1="12" y1="17" x2="12" y2="10" />
    <line x1="15" y1="17" x2="15" y2="14" />
  </svg>
);

const PageHeader = ({ title }) => {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderInner}>
        <div className={styles.pageHeaderBody}>
          <div className={styles.pageHeaderBrand}>
            <div className={styles.pageHeaderTitleRow}>
              <span className={styles.pageHeaderIcon} aria-hidden="true">
                <NavbarDashboardIcon />
              </span>
              <h6 className={styles.pageHeaderTitle}>{title}</h6>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
