import React from "react";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import styles from "../styles/MetricCards.module.css";

const MetricCards = ({ metrics }) => {
  const { totalAtendimentos, taxaConversaoGeral } = metrics || {};

  const cards = [
    {
      title: "Total de atendimentos",
      value: totalAtendimentos,
      icon: <AssessmentOutlinedIcon fontSize="medium" />,
    },
    {
      title: "Taxa geral de conversão",
      value:
        typeof taxaConversaoGeral === "number"
          ? `${taxaConversaoGeral.toFixed(1)}%`
          : "0%",
      icon: <PercentOutlinedIcon fontSize="medium" />,
    },
  ];

  return (
    <section className={styles.cardsContainer}>
      {cards.map((card) => (
        <div key={card.title} className={styles.card}>
          <div className={styles.icon}>{card.icon}</div>
          <div className={styles.info}>
            <span className={styles.value}>{card.value ?? 0}</span>
            <span className={styles.title}>{card.title}</span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default MetricCards;

