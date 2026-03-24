import React from "react";
import Person from "@mui/icons-material/Person";
import styles from "../styles/PageHeader.module.css";

const PageHeader = ({ title }) => {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.pageHeaderInner}>
        <div className={styles.pageHeaderBody}>
          <div className={styles.pageHeaderBrand}>
            <div className={styles.pageHeaderTitleRow}>
              <span className={styles.pageHeaderIcon} aria-hidden="true">
                <Person sx={{ fontSize: 30, color: "inherit" }} />
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
