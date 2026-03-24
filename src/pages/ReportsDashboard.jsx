import React, { useEffect, useMemo, useState } from "react";
import ReportFilters from "../components/ReportFilters";
import PageHeader from "../components/PageHeader";
import MetricCards from "../components/MetricCards";
import ChartsSection from "../components/ChartsSection";
import ReportTable from "../components/ReportTable";
import styles from "../styles/ReportsDashboard.module.css";
import {
  applyFilters,
  fetchReportData,
  generateCategoryStats,
  generateSectorStats,
  generateUserRanking,
  generateChannelStats,
  generateDailyStats,
  generateTopContactsStats,
  calculateSummaryMetrics,
  generateSectorConversion,
  generateChannelConversion,
  generateUserPerformance,
} from "../services/reportService";

const ReportsDashboard = () => {
  const [systemKey, setSystemKey] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    "Selecione os filtros e clique em Gerar relatório."
  );
  const [hasGenerated, setHasGenerated] = useState(false);
  const [chartFilter, setChartFilter] = useState(null);

  useEffect(() => {
    if (window?.WlExtension?.getInfoUser) {
      window.WlExtension
        .getInfoUser()
        .then((data) => {
          if (data?.systemKey) {
            setSystemKey(data.systemKey);
          }
        })
        .catch(() => {
          setError("Não foi possível obter o systemKey.");
        });
    } else {
      setError("Extensão WlExtension não disponível.");
    }
  }, []);

  const fetchBaseData = async () => {
    if (!systemKey) return;

    try {
      const data = await fetchReportData(systemKey);
      setReportData(data || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar relatório.");
    }
  };

  // Busca os dados ao carregar (sem exibir relatório automaticamente)
  useEffect(() => {
    if (!systemKey) return;
    fetchBaseData();
  }, [systemKey]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleGenerateReport = async () => {
    if (!systemKey) {
      setError("System key não disponível.");
      return;
    }

    try {
      // Se ainda não buscou, busca agora, mas só exibe após clicar em Gerar relatório
      let base = reportData;
      if (!base || !base.length) {
        setLoading(true);
        setError(null);
        base = (await fetchReportData(systemKey)) || [];
        setReportData(base);
        setLoading(false);
      }

      setError(null);
      setStatusMessage("");
      setHasGenerated(true);

      const filtered = applyFilters(base || [], filters);
      setFilteredData(filtered);

      if (!filtered.length) {
        setStatusMessage(
          "Nenhum atendimento encontrado para os filtros selecionados."
        );
      }
    } catch (err) {
      setError(err.message || "Erro ao carregar relatório.");
    }
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      startDate: "",
      endDate: "",
      setor: [],
      usuario: [],
      category: [],
      canal: [],
      contatoNome: "",
      contatoNumero: "",
    };

    setFilters(emptyFilters);
    if (reportData.length) {
      const filtered = applyFilters(reportData, emptyFilters);
      setFilteredData(filtered);
      setStatusMessage("");
    } else {
      setFilteredData([]);
      setStatusMessage("Selecione os filtros e clique em Gerar relatório.");
    }
  };

  useEffect(() => {
    if (!hasGenerated || !reportData.length) return;
    const filtered = applyFilters(reportData, filters);
    setFilteredData(filtered);

    if (!filtered.length) {
      setStatusMessage(
        "Nenhum atendimento encontrado para os filtros selecionados."
      );
    } else {
      setStatusMessage("");
    }
  }, [filters, hasGenerated, reportData]);

  const metrics = useMemo(
    () => calculateSummaryMetrics(filteredData),
    [filteredData]
  );

  const tableData = useMemo(() => {
    if (!chartFilter) return filteredData;

    return filteredData.filter((item) => {
      const { field, value } = chartFilter;
      if (field === "date") {
        if (!item.dateFinalize) return false;
        const d = new Date(item.dateFinalize);
        if (Number.isNaN(d.getTime())) return false;
        const key = d.toISOString().slice(0, 10);
        return key === value;
      }
      return (item[field] || "").toString() === value;
    });
  }, [chartFilter, filteredData]);

  const chartsData = useMemo(() => {
    return {
      categoryStats: generateCategoryStats(filteredData),
      sectorStats: generateSectorStats(filteredData),
      userRanking: generateUserRanking(filteredData),
      channelStats: generateChannelStats(filteredData),
      dailyStats: generateDailyStats(filteredData),
      topContacts: generateTopContactsStats(filteredData),
      sectorConversion: generateSectorConversion(filteredData),
      channelConversion: generateChannelConversion(filteredData),
      userPerformance: generateUserPerformance(filteredData),
    };
  }, [filteredData]);

  const hasCategoriesOutsideConversion = useMemo(() => {
    const allowed = new Set(["Agendou", "Não agendou"]);
    return filteredData.some((i) => i.category && !allowed.has(i.category));
  }, [filteredData]);

  const handleChartFilterChange = (payload) => {
    if (!payload) {
      setChartFilter(null);
      return;
    }

    const sameFilter =
      chartFilter &&
      chartFilter.field === payload.field &&
      chartFilter.value === payload.value;

    setChartFilter(sameFilter ? null : payload);
  };

  return (
    <div className={styles.pageRoot}>
      <PageHeader title="Dashboard - Atendimentos Categorizados" />
      <div className={styles.mainShell}>
        <div className={styles.content}>
          {loading && (
            <div className={styles.topProgressWrapper}>
              <div className={styles.topProgressBar} />
            </div>
          )}
          <ReportFilters
            data={reportData}
            filters={filters}
            onChange={handleFiltersChange}
            onGenerate={handleGenerateReport}
            onClear={handleClearFilters}
            disabled={loading || !systemKey}
          />

          {loading && (
            <div className={styles.stateMessage}>Carregando dados...</div>
          )}

          {!loading && statusMessage && (
            <div className={styles.stateMessage}>{statusMessage}</div>
          )}

          {!loading && !!filteredData.length && (
            <>
              <MetricCards metrics={metrics} />
              <ChartsSection
                chartsData={chartsData}
                onChartFilterChange={handleChartFilterChange}
                showConversionInfo={hasCategoriesOutsideConversion}
              />
              <ReportTable data={tableData} />
            </>
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;

