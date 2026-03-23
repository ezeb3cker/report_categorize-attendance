import React, { useMemo, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import styles from "../styles/ReportTable.module.css";

const PREVIEW_LIMIT = 10;

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

const ToggleList = ({ title, options, selected, onToggle }) => {
  return (
    <div className={styles.exportGroup}>
      <div className={styles.exportGroupTitle}>{title}</div>
      <div className={styles.exportOptionsList}>
        {options.length ? (
          options.map((opt) => (
            <label key={opt} className={styles.exportOptionItem}>
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
              />
              <span>{opt}</span>
            </label>
          ))
        ) : (
          <div className={styles.exportEmpty}>Sem opções</div>
        )}
      </div>
    </div>
  );
};

const getCategoryClassName = (category) => {
  if (category === "Agendou") return styles.categoryPillSuccess;
  if (category === "Não agendou") return styles.categoryPillDefault;
  if (!category) return styles.categoryPillNeutral;

  const palette = [
    styles.categoryPillInfo,
    styles.categoryPillWarning,
    styles.categoryPillIndigo,
  ];

  let hash = 0;
  for (let i = 0; i < category.length; i += 1) {
    // simples hash de string
    hash = (hash << 5) - hash + category.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

const ReportTable = ({ data }) => {
  const [sortField, setSortField] = useState("dateFinalize");
  const [sortDirection, setSortDirection] = useState("desc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exportFilters, setExportFilters] = useState({
    categories: [],
    setores: [],
    canais: [],
    usuarios: [],
    startDate: "",
    endDate: "",
  });
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const tableRef = useRef(null);

  const exportOptions = useMemo(() => {
    const categories = new Set();
    const setores = new Set();
    const canais = new Set();
    const usuarios = new Set();

    data.forEach((item) => {
      if (item.category) categories.add(item.category);
      if (item.setorNome) setores.add(item.setorNome);
      if (item.canalNome) canais.add(item.canalNome);
      if (item.usuarioNome) usuarios.add(item.usuarioNome);
    });

    const sortStr = (a, b) => a.localeCompare(b, "pt-BR");

    return {
      categories: Array.from(categories).sort(sortStr),
      setores: Array.from(setores).sort(sortStr),
      canais: Array.from(canais).sort(sortStr),
      usuarios: Array.from(usuarios).sort(sortStr),
    };
  }, [data]);

  const applyExportFilters = (rows) => {
    const { categories, setores, canais, usuarios, startDate, endDate } =
      exportFilters;

    const start =
      startDate && startDate.length >= 10
        ? new Date(`${startDate}T00:00:00`)
        : null;

    const end =
      endDate && endDate.length >= 10
        ? new Date(`${endDate}T23:59:59.999`)
        : null;

    return rows.filter((item) => {
      if (categories.length && !categories.includes(item.category || "")) {
        return false;
      }
      if (setores.length && !setores.includes(item.setorNome || "")) {
        return false;
      }
      if (canais.length && !canais.includes(item.canalNome || "")) {
        return false;
      }
      if (usuarios.length && !usuarios.includes(item.usuarioNome || "")) {
        return false;
      }

      if (start || end) {
        if (!item.dateFinalize) return false;
        const d = new Date(item.dateFinalize);
        if (Number.isNaN(d.getTime())) return false;
        if (start && d < start) return false;
        if (end && d > end) return false;
      }

      return true;
    });
  };

  const toggleExportSelection = (key, value) => {
    setExportFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const runExport = (format, rows) => {
    const headers = [
      "Data de finalização",
      "Categoria",
      "Setor",
      "Usuário",
      "Contato",
      "Número",
      "Canal",
      "Observação",
    ];

    const csvRows = rows.map((item) => [
      formatDateTime(item.dateFinalize),
      item.category || "",
      item.setorNome || "",
      item.usuarioNome || "",
      item.contatoNome || "",
      item.contatoNumero || "",
      item.canalNome || "",
      (item.observation || "").replace(/\r?\n/g, " "),
    ]);

    const csvContent = [headers, ...csvRows]
      .map((row) =>
        row
          .map((cell) => {
            const v = String(cell ?? "");
            if (v.includes(",") || v.includes('"') || v.includes("\n")) {
              return `"${v.replace(/"/g, '""')}"`;
            }
            return v;
          })
          .join(",")
      )
      .join("\n");

    const blob =
      format === "excel"
        ? new Blob([csvContent], {
            type: "application/vnd.ms-excel;charset=utf-8;",
          })
        : new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      format === "excel"
        ? "relatorio-atendimentos.xlsx"
        : "relatorio-atendimentos.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const processedData = useMemo(() => {
    let result = [...data];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) => {
        return (
          item.category?.toLowerCase().includes(searchLower) ||
          item.setorNome?.toLowerCase().includes(searchLower) ||
          item.usuarioNome?.toLowerCase().includes(searchLower) ||
          item.contatoNome?.toLowerCase().includes(searchLower) ||
          item.contatoNumero?.toLowerCase().includes(searchLower) ||
          item.canalNome?.toLowerCase().includes(searchLower) ||
          item.observation?.toLowerCase().includes(searchLower)
        );
      });
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortField === "dateFinalize") {
        const aDate = new Date(aVal || 0).getTime();
        const bDate = new Date(bVal || 0).getTime();
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }

      const aStr = (aVal || "").toString().toLowerCase();
      const bStr = (bVal || "").toString().toLowerCase();

      if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
      if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, search, sortDirection, sortField]);

  const exportPreviewData = useMemo(() => {
    return applyExportFilters(processedData);
  }, [processedData, exportFilters]);

  const exportPreviewRows = useMemo(() => {
    return exportPreviewData.slice(0, PREVIEW_LIMIT);
  }, [exportPreviewData]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [currentPage, pageSize, processedData]);

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "▲" : "▼";
  };

  return (
    <section ref={tableRef} className={styles.tableSection}>
      <div className={styles.tableHeader}>
        <div className={styles.left}>
          <h3>Detalhamento de atendimentos</h3>
          <span className={styles.count}>
            {processedData.length} registros encontrados
          </span>
        </div>
        <div className={styles.right}>
          <input
            type="text"
            placeholder="Busca rápida..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <button
            type="button"
            className={styles.exportButtonPrimary}
            onClick={() => {
              setExportFormat("excel");
              setExportModalOpen(true);
            }}
          >
            <FileDownloadOutlinedIcon fontSize="small" /> Exportar para Excel
          </button>
          <button
            type="button"
            className={styles.exportButtonPrimary}
            onClick={() => {
              setExportFormat("csv");
              setExportModalOpen(true);
            }}
          >
            <FileDownloadOutlinedIcon fontSize="small" /> Exportar para CSV
          </button>
        </div>
      </div>

      {exportModalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setExportModalOpen(false);
          }}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>
                  Exportar relatório ({exportFormat === "excel" ? "Excel" : "CSV"})
                </div>
                <div className={styles.modalSubtitle}>
                  Selecione os filtros e confira a pré-visualização antes de exportar.
                </div>
              </div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setExportModalOpen(false)}
                aria-label="Fechar"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalFilters}>
                <ToggleList
                  title="Categoria"
                  options={exportOptions.categories}
                  selected={exportFilters.categories}
                  onToggle={(v) => toggleExportSelection("categories", v)}
                />
                <ToggleList
                  title="Setor"
                  options={exportOptions.setores}
                  selected={exportFilters.setores}
                  onToggle={(v) => toggleExportSelection("setores", v)}
                />
                <ToggleList
                  title="Canal"
                  options={exportOptions.canais}
                  selected={exportFilters.canais}
                  onToggle={(v) => toggleExportSelection("canais", v)}
                />
                <ToggleList
                  title="Usuário"
                  options={exportOptions.usuarios}
                  selected={exportFilters.usuarios}
                  onToggle={(v) => toggleExportSelection("usuarios", v)}
                />

                <div className={styles.exportGroup}>
                  <div className={styles.exportGroupTitle}>Período</div>
                  <div className={styles.exportDates}>
                    <div className={styles.exportDateField}>
                      <label>Data inicial</label>
                      <input
                        type="date"
                        value={exportFilters.startDate}
                        onChange={(e) =>
                          setExportFilters((prev) => ({
                            ...prev,
                            startDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={styles.exportDateField}>
                      <label>Data final</label>
                      <input
                        type="date"
                        value={exportFilters.endDate}
                        onChange={(e) =>
                          setExportFilters((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalPreview}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewTitle}>Pré-visualização</div>
                  <div className={styles.previewCount}>
                    {exportPreviewData.length} registros serão exportados
                    {exportPreviewData.length > PREVIEW_LIMIT
                      ? ` (mostrando ${PREVIEW_LIMIT})`
                      : ""}
                  </div>
                </div>

                <div className={styles.previewTableWrapper}>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Categoria</th>
                        <th>Setor</th>
                        <th>Usuário</th>
                        <th>Contato</th>
                        <th>Canal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exportPreviewRows.map((item) => (
                        <tr key={`preview-${item._id || item.attendanceId}`}>
                          <td>{formatDateTime(item.dateFinalize)}</td>
                          <td>{item.category || "-"}</td>
                          <td>{item.setorNome || "-"}</td>
                          <td>{item.usuarioNome || "-"}</td>
                          <td>{item.contatoNome || "-"}</td>
                          <td>{item.canalNome || "-"}</td>
                        </tr>
                      ))}
                      {!exportPreviewRows.length && (
                        <tr>
                          <td colSpan={6} className={styles.previewEmpty}>
                            Nenhum dado para exportar com os filtros selecionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.exportButton}
                onClick={() =>
                  setExportFilters({
                    categories: [],
                    setores: [],
                    canais: [],
                    usuarios: [],
                    startDate: "",
                    endDate: "",
                  })
                }
              >
                Limpar filtros
              </button>
              <div className={styles.modalFooterRight}>
                <button
                  type="button"
                  className={styles.exportButton}
                  onClick={() => setExportModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.exportButtonPrimary}
                  disabled={!exportPreviewData.length}
                  onClick={() => {
                    runExport(exportFormat, exportPreviewData);
                    setExportModalOpen(false);
                  }}
                >
                  Exportar {exportFormat === "excel" ? "Excel" : "CSV"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort("dateFinalize")}>
                Data de finalização {renderSortIndicator("dateFinalize")}
              </th>
              <th onClick={() => handleSort("category")}>
                Categoria {renderSortIndicator("category")}
              </th>
              <th onClick={() => handleSort("setorNome")}>
                Setor {renderSortIndicator("setorNome")}
              </th>
              <th onClick={() => handleSort("usuarioNome")}>
                Usuário {renderSortIndicator("usuarioNome")}
              </th>
              <th onClick={() => handleSort("contatoNome")}>
                Contato {renderSortIndicator("contatoNome")}
              </th>
              <th onClick={() => handleSort("contatoNumero")}>
                Número {renderSortIndicator("contatoNumero")}
              </th>
              <th onClick={() => handleSort("canalNome")}>
                Canal {renderSortIndicator("canalNome")}
              </th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((item) => (
              <tr key={item._id || item.attendanceId}>
                <td>{formatDateTime(item.dateFinalize)}</td>
                <td>
                  <span
                    className={getCategoryClassName(item.category)}
                  >
                    {item.category || "-"}
                  </span>
                </td>
                <td>{item.setorNome || "-"}</td>
                <td>{item.usuarioNome || "-"}</td>
                <td>{item.contatoNome || "-"}</td>
                <td>{item.contatoNumero || "-"}</td>
                <td>{item.canalNome || "-"}</td>
                <td>{item.observation || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <div className={styles.pageSizeWrapper}>
          <span className={styles.pageSizeLabel}>Itens por página:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value) || 10;
              setPageSize(newSize);
              setPage(1);
            }}
          >
            {[10, 20, 30, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.paginationControls}>
          <button
            type="button"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próxima
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReportTable;

