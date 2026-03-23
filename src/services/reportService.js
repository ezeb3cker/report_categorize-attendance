export async function fetchReportData(systemKey) {
  if (!systemKey) {
    throw new Error("System key não informado.");
  }

  const url = `https://dev.gruponfa.com/webhook/report/categorize-attendance?systemId=${encodeURIComponent(systemKey)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Erro ao buscar dados do relatório.");
  }

  return response.json();
}

export function applyFilters(data, filters) {
  if (!Array.isArray(data)) return [];

  return data.filter((item) => {
    const {
      startDate,
      endDate,
      setor,
      usuario,
      category,
      canal,
      contatoNome,
      contatoNumero,
    } = filters || {};

    const itemDate = item.dateFinalize ? new Date(item.dateFinalize) : null;

    const start =
      startDate && startDate.length >= 10
        ? new Date(`${startDate}T00:00:00`)
        : null;

    // Data final deve considerar o dia inteiro (23:59:59.999)
    const end =
      endDate && endDate.length >= 10
        ? new Date(`${endDate}T23:59:59.999`)
        : null;

    if (start && itemDate && itemDate < start) {
      return false;
    }

    if (end && itemDate && itemDate > end) {
      return false;
    }

    const matchesMulti = (value, filterValue) => {
      if (Array.isArray(filterValue)) {
        if (!filterValue.length) return true;
        return filterValue.includes(value || "");
      }
      if (!filterValue || filterValue === "all") return true;
      return (value || "") === filterValue;
    };

    if (!matchesMulti(item.setorNome, setor)) return false;
    if (!matchesMulti(item.usuarioNome, usuario)) return false;
    if (!matchesMulti(item.category, category)) return false;
    if (!matchesMulti(item.canalNome, canal)) return false;

    if (
      contatoNome &&
      !item.contatoNome
        ?.toLowerCase()
        .includes(contatoNome.toLowerCase().trim())
    ) {
      return false;
    }

    if (
      contatoNumero &&
      !item.contatoNumero
        ?.toLowerCase()
        .includes(contatoNumero.toLowerCase().trim())
    ) {
      return false;
    }

    return true;
  });
}

export function generateCategoryStats(data) {
  const counts = {};

  data.forEach((item) => {
    const key = item.category || "Sem categoria";
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

export function generateSectorStats(data) {
  const counts = {};

  data.forEach((item) => {
    const key = item.setorNome || "Sem setor";
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

export function generateUserRanking(data) {
  const counts = {};

  data.forEach((item) => {
    const key = item.usuarioNome || "Sem usuário";
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

export function generateChannelStats(data) {
  const counts = {};

  data.forEach((item) => {
    const key = item.canalNome || "Sem canal";
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

export function generateDailyStats(data) {
  const counts = {};

  data.forEach((item) => {
    if (!item.dateFinalize) return;
    const date = new Date(item.dateFinalize);
    if (Number.isNaN(date.getTime())) return;

    const key = date.toISOString().slice(0, 10);
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

export function generateTopContactsStats(data, topN = 10) {
  const counts = {};

  data.forEach((item) => {
    const key = item.contatoNome || "Sem nome";
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
}

export function calculateSummaryMetrics(data) {
  const totalAtendimentos = data.length;

  const contatosSet = new Set();
  const usuariosSet = new Set();
  const setoresSet = new Set();
  const categoriasSet = new Set();

  let totalAgendou = 0;

  data.forEach((item) => {
    if (item.contatoNumero) {
      contatosSet.add(item.contatoNumero);
    }
    if (item.usuarioNome) {
      usuariosSet.add(item.usuarioNome);
    }
    if (item.setorNome) {
      setoresSet.add(item.setorNome);
    }
    if (item.category) {
      categoriasSet.add(item.category);
    }
    if (item.category === "Agendou") {
      totalAgendou += 1;
    }
  });

  const taxaConversaoGeral =
    totalAtendimentos > 0 ? (totalAgendou / totalAtendimentos) * 100 : 0;

  return {
    totalAtendimentos,
    contatosUnicos: contatosSet.size,
    usuariosAtivos: usuariosSet.size,
    setoresEnvolvidos: setoresSet.size,
    categoriasUtilizadas: categoriasSet.size,
    taxaConversaoGeral,
  };
}

export function generateSectorConversion(data) {
  const map = new Map();

  data.forEach((item) => {
    if (item.category !== "Agendou" && item.category !== "Não agendou") return;

    const setor = item.setorNome || "Sem setor";
    const current =
      map.get(setor) || { setor, total: 0, agendou: 0, naoAgendou: 0, conversao: 0 };
    current.total += 1;
    if (item.category === "Agendou") {
      current.agendou += 1;
    } else {
      current.naoAgendou += 1;
    }
    map.set(setor, current);
  });

  return Array.from(map.values()).map((entry) => ({
    ...entry,
    conversao:
      entry.total > 0 ? Number(((entry.agendou / entry.total) * 100).toFixed(2)) : 0,
  }));
}

export function generateChannelConversion(data) {
  const map = new Map();

  data.forEach((item) => {
    if (item.category !== "Agendou" && item.category !== "Não agendou") return;

    const canal = item.canalNome || "Sem canal";
    const current =
      map.get(canal) || { canal, total: 0, agendou: 0, naoAgendou: 0, conversao: 0 };
    current.total += 1;
    if (item.category === "Agendou") {
      current.agendou += 1;
    } else {
      current.naoAgendou += 1;
    }
    map.set(canal, current);
  });

  return Array.from(map.values()).map((entry) => ({
    ...entry,
    conversao:
      entry.total > 0 ? Number(((entry.agendou / entry.total) * 100).toFixed(2)) : 0,
  }));
}

export function generateUserPerformance(data) {
  const map = new Map();

  data.forEach((item) => {
    const usuario = item.usuarioNome || "Sem usuário";
    const current =
      map.get(usuario) || { usuario, total: 0, agendou: 0, conversao: 0 };
    current.total += 1;
    if (item.category === "Agendou") {
      current.agendou += 1;
    }
    map.set(usuario, current);
  });

  return Array.from(map.values())
    .map((entry) => ({
      ...entry,
      conversao:
        entry.total > 0
          ? Number(((entry.agendou / entry.total) * 100).toFixed(2))
          : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

