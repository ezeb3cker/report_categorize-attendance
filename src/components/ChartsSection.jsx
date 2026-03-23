import React from "react";
import styles from "../styles/ChartsSection.module.css";
import CategoryChart from "./charts/CategoryChart";
import SectorChart from "./charts/SectorChart";
import SectorConversionChart from "./charts/SectorConversionChart";
import ChannelConversionChart from "./charts/ChannelConversionChart";
import UserRankingChart from "./charts/UserRankingChart";
import ChannelChart from "./charts/ChannelChart";
import DailyChart from "./charts/DailyChart";
import TopContactsChart from "./charts/TopContactsChart";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ChartsSection = ({ chartsData, onChartFilterChange, showConversionInfo }) => {
  if (!chartsData) return null;

  return (
    <section className={styles.chartsContainer}>
      <div className={styles.chartItem}>
        <h3>Atendimentos por categoria</h3>
        <div className={styles.compactChartBody}>
          <CategoryChart
            data={chartsData.categoryStats}
            onFilterChange={onChartFilterChange}
          />
        </div>
      </div>

      <div className={styles.chartItem}>
        <h3>Atendimentos por setor</h3>
        <div className={styles.chartBody}>
          <SectorChart
            data={chartsData.sectorStats}
            onFilterChange={onChartFilterChange}
          />
        </div>
      </div>

      <div className={styles.chartItem}>
        <div className={styles.chartTitleRow}>
          <h3>Conversão por setor</h3>
          {showConversionInfo && (
            <div className={styles.infoWrapper} tabIndex={0}>
              <InfoOutlinedIcon fontSize="small" />
              <div className={styles.infoTooltip}>
                Esse gráfico de conversão considera apenas as categorias
                “Agendou” e “Não agendou”.
              </div>
            </div>
          )}
        </div>
        <div className={styles.chartBody}>
          <SectorConversionChart
            data={chartsData.sectorConversion}
            onFilterChange={onChartFilterChange}
          />
        </div>
      </div>

      <div className={styles.chartItem}>
        <h3>Ranking de usuários</h3>
        <div className={styles.chartBody}>
          <UserRankingChart
            data={chartsData.userRanking}
            onFilterChange={onChartFilterChange}
          />
        </div>
      </div>

      <div className={styles.chartItem}>
        <h3>Atendimentos por canal</h3>
        <div className={styles.compactChartBody}>
          <ChannelChart
            data={chartsData.channelStats}
            onFilterChange={onChartFilterChange}
          />
        </div>
      </div>

      <div className={styles.chartItem}>
        <div className={styles.chartTitleRow}>
          <h3>Conversão por canal</h3>
          {showConversionInfo && (
            <div className={styles.infoWrapper} tabIndex={0}>
              <InfoOutlinedIcon fontSize="small" />
              <div className={styles.infoTooltip}>
              Esse gráfico de conversão considera apenas as categorias
              “Agendou” e “Não agendou”.
              </div>
            </div>
          )}
        </div>
        <div className={styles.chartBody}>
          <ChannelConversionChart
            data={chartsData.channelConversion}
            onFilterChange={onChartFilterChange}
          />
        </div>
      </div>

      <div className={`${styles.chartItem} ${styles.chartItemWide}`}>
        <h3>Atendimentos por dia</h3>
        <div className={styles.chartBody}>
          <DailyChart
            data={chartsData.dailyStats}
            onFilterChange={onChartFilterChange}
          />
        </div>
      </div>

      <div className={styles.chartItem}>
        <h3>Atendimentos por contatos</h3>
        <div className={styles.chartBody}>
          <TopContactsChart
            data={chartsData.topContacts}
            onFilterChange={onChartFilterChange}
          />
        </div>
      </div>
    </section>
  );
};

export default ChartsSection;

