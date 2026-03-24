import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/ReportFilters.module.css";

const getUniqueValues = (data, key) => {
  const set = new Set();
  data.forEach((item) => {
    if (item[key]) set.add(item[key]);
  });
  return Array.from(set);
};

const SelectChevron = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    aria-hidden="true"
    focusable="false"
    className={styles.chevronSvg}
  >
    <path
      fill="currentColor"
      d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"
    />
  </svg>
);

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
}) => {
  const hasSelection = values && values.length > 0;
  const displayValue = hasSelection ? values.join(", ") : placeholder || label;

  const handleToggle = (option) => {
    const exists = values.includes(option);
    const next = exists ? values.filter((v) => v !== option) : [...values, option];
    onChange({ target: { name, value: next } });
  };

  return (
    <div className={`${styles.field} ${styles.filter} ${styles.multiSelectRoot}`}>
      <h6 className={styles.filterLabel}>{label}</h6>
      <div
        className={`${styles.multiSelectControl} ${
          isOpen ? styles.multiSelectControlOpen : ""
        }`}
        onClick={() => {
          if (disabled) return;
          onToggleOpen?.();
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleOpen?.();
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className={styles.selectValueContainer}>
          <span
            className={`${styles.multiSelectText} ${
              !hasSelection ? styles.selectPlaceholder : ""
            }`}
          >
            {displayValue}
          </span>
        </div>
        <div className={styles.selectIndicators}>
          <span className={styles.indicatorSeparator} aria-hidden="true" />
          <span className={styles.indicatorChevron}>
            <SelectChevron />
          </span>
        </div>
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
        <div className={`${styles.field} ${styles.filter}`}>
          <h6 className={styles.filterLabel}>Data inicial</h6>
          <input
            type="date"
            name="startDate"
            value={filters.startDate || ""}
            onChange={handleInputChange}
            disabled={disabled}
            className={!filters.startDate ? styles.dateInputEmpty : undefined}
          />
        </div>

        <div className={`${styles.field} ${styles.filter}`}>
          <h6 className={styles.filterLabel}>Data final</h6>
          <input
            type="date"
            name="endDate"
            value={filters.endDate || ""}
            onChange={handleInputChange}
            disabled={disabled}
            className={!filters.endDate ? styles.dateInputEmpty : undefined}
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
          onChange={(event) =>
            onChange({ ...filters, [event.target.name]: event.target.value })
          }
          disabled={disabled}
        />

        <div className={`${styles.field} ${styles.filter}`}>
          <h6 className={styles.filterLabel}>Nome do contato</h6>
          <input
            type="text"
            name="contatoNome"
            placeholder="Ex.: João da Silva"
            value={filters.contatoNome || ""}
            onChange={handleInputChange}
            disabled={disabled}
          />
        </div>

        <div className={`${styles.field} ${styles.filter}`}>
          <h6 className={styles.filterLabel}>Número do contato</h6>
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
