import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/ReportFilters.module.css";

const getUniqueValues = (data, key) => {
  const set = new Set();
  data.forEach((item) => {
    if (item[key]) set.add(item[key]);
  });
  return Array.from(set);
};

const MultiSelect = ({
  label,
  name,
  options,
  values = [],
  onChange,
  disabled,
  placeholder,
  isOpen,
  onToggleOpen,
  onClose,
}) => {

  const displayValue =
    !values || values.length === 0
      ? placeholder || label
      : values.join(", ");

  const handleToggle = (option) => {
    const exists = values.includes(option);
    const next = exists ? values.filter((v) => v !== option) : [...values, option];
    onChange({ target: { name, value: next } });
  };

  return (
    <div className={`${styles.field} ${styles.multiSelectRoot}`}>
      <label>{label}</label>
      <div
        className={`${styles.multiSelectControl} ${
          isOpen ? styles.multiSelectControlOpen : ""
        }`}
        onClick={() => {
          if (disabled) return;
          onToggleOpen?.();
        }}
      >
        <span className={styles.multiSelectText}>{displayValue}</span>
        <span className={styles.multiSelectArrow}>▾</span>
      </div>
      {isOpen && !disabled && (
        <div className={styles.multiSelectDropdown}>
          <div className={styles.multiSelectOptions}>
            {options.map((opt) => (
              <label
                key={opt}
                className={`${styles.multiSelectOption} ${
                  values.includes(opt) ? styles.multiSelectOptionSelected : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={values.includes(opt)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggle(opt);
                  }}
                />
                <span>{opt}</span>
                {values.includes(opt) && (
                  <button
                    type="button"
                    className={styles.optionRemoveButton}
                    aria-label={`Remover ${opt}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(opt);
                    }}
                  >
                    ×
                  </button>
                )}
              </label>
            ))}
            {!options.length && (
              <div className={styles.multiSelectEmpty}>Nenhuma opção</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ReportFilters = ({
  data,
  filters,
  onChange,
  onGenerate,
  onClear,
  disabled,
}) => {
  const setores = useMemo(() => getUniqueValues(data, "setorNome"), [data]);
  const usuarios = useMemo(() => getUniqueValues(data, "usuarioNome"), [data]);
  const categorias = useMemo(() => getUniqueValues(data, "category"), [data]);
  const canais = useMemo(() => getUniqueValues(data, "canalNome"), [data]);
  const [openName, setOpenName] = useState(null);
  const containerRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  // Fecha qualquer dropdown ao clicar fora do container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setOpenName(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section
      ref={containerRef}
      className={styles.filtersContainer}
      onMouseDownCapture={(event) => {
        if (!openName) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (!target.closest(`.${styles.multiSelectRoot}`)) {
          setOpenName(null);
        }
      }}
    >
      <div className={styles.row}>
        <div className={styles.field}>
          <label>Data inicial</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate || ""}
            onChange={handleInputChange}
            disabled={disabled}
          />
        </div>

        <div className={styles.field}>
          <label>Data final</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate || ""}
            onChange={handleInputChange}
            disabled={disabled}
          />
        </div>

        <MultiSelect
          label="Setor"
          name="setor"
          options={setores}
          values={filters.setor || []}
          placeholder="Setores"
          isOpen={openName === "setor"}
          onToggleOpen={() =>
            setOpenName((prev) => (prev === "setor" ? null : "setor"))
          }
          onClose={() => setOpenName(null)}
          onChange={(event) =>
            onChange({ ...filters, [event.target.name]: event.target.value })
          }
          disabled={disabled}
        />

        <MultiSelect
          label="Usuário"
          name="usuario"
          options={usuarios}
          values={filters.usuario || []}
          placeholder="Usuários"
          isOpen={openName === "usuario"}
          onToggleOpen={() =>
            setOpenName((prev) => (prev === "usuario" ? null : "usuario"))
          }
          onClose={() => setOpenName(null)}
          onChange={(event) =>
            onChange({ ...filters, [event.target.name]: event.target.value })
          }
          disabled={disabled}
        />
      </div>

      <div className={styles.row}>
        <MultiSelect
          label="Categoria"
          name="category"
          options={categorias}
          values={filters.category || []}
          placeholder="Categorias"
          isOpen={openName === "category"}
          onToggleOpen={() =>
            setOpenName((prev) => (prev === "category" ? null : "category"))
          }
          onClose={() => setOpenName(null)}
          onChange={(event) =>
            onChange({ ...filters, [event.target.name]: event.target.value })
          }
          disabled={disabled}
        />

        <MultiSelect
          label="Canal"
          name="canal"
          options={canais}
          values={filters.canal || []}
          placeholder="Canais"
          isOpen={openName === "canal"}
          onToggleOpen={() =>
            setOpenName((prev) => (prev === "canal" ? null : "canal"))
          }
          onClose={() => setOpenName(null)}
          onChange={(event) =>
            onChange({ ...filters, [event.target.name]: event.target.value })
          }
          disabled={disabled}
        />

        <div className={styles.field}>
          <label>Nome do contato</label>
          <input
            type="text"
            name="contatoNome"
            placeholder="Ex.: João da Silva"
            value={filters.contatoNome || ""}
            onChange={handleInputChange}
            disabled={disabled}
          />
        </div>

        <div className={styles.field}>
          <label>Número do contato</label>
          <input
            type="text"
            name="contatoNumero"
            placeholder="Ex.: 5554999999999"
            value={filters.contatoNumero || ""}
            onChange={handleInputChange}
            disabled={disabled}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            setOpenName(null);
            onGenerate();
          }}
          disabled={disabled}
        >
          Gerar relatório
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => {
            setOpenName(null);
            onClear();
          }}
          disabled={disabled}
        >
          Limpar filtros
        </button>
      </div>
    </section>
  );
};

export default ReportFilters;

