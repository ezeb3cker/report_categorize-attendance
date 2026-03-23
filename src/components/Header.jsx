import React from "react";
import styles from "../styles/Header.module.css";

const Header = ({ onRefresh, loading }) => {
  return (
    <header className={styles.header}>
      <div className={styles.titles}>
        <h1 className={styles.title}>Relatórios de Atendimentos</h1>
        <p className={styles.subtitle}>
          Análise de atendimentos finalizados e categorizados
        </p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.refreshButton}
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Atualizando..." : "Atualizar dados"}
        </button>
      </div>
    </header>
  );
};

export default Header;

