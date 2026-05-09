const {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} = window.React;

import {
  FINANCE_CASH_DENOMINATIONS,
  FINANCE_PERIOD_FILTERS,
  FINANCE_PRESETS,
} from "./constants.js";
import {
  ArrowInIcon,
  ArrowOutIcon,
  PencilIcon,
  RefreshIcon,
  TrashIcon,
  WalletIcon,
} from "./icons.jsx";

const { ipcRenderer } = window.require("electron");

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  month: "short",
  year: "2-digit",
});

function todayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildEmptyFormState(presetId = "expense-posted") {
  const preset = FINANCE_PRESETS.find((entry) => entry.id === presetId) || FINANCE_PRESETS[0];

  return {
    id: "",
    presetId: preset.id,
    kind: preset.kind,
    status: preset.status,
    title: "",
    amount: "",
    movementDate: todayLocalDate(),
    category: "",
    platform: "",
    counterparty: "",
    notes: "",
  };
}

function buildFormStateFromMovement(movement) {
  const preset =
    FINANCE_PRESETS.find(
      (entry) => entry.kind === movement?.kind && entry.status === movement?.status,
    ) || FINANCE_PRESETS[0];

  return {
    id: movement?.id || "",
    presetId: preset.id,
    kind: preset.kind,
    status: preset.status,
    title: movement?.title || "",
    amount: Number.isFinite(Number(movement?.amountCents))
      ? (Number(movement.amountCents) / 100).toFixed(2)
      : "",
    movementDate: movement?.movementDate || todayLocalDate(),
    category: movement?.category || "",
    platform: movement?.platform || "",
    counterparty: movement?.counterparty || "",
    notes: movement?.notes || "",
  };
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getSignedAmountCents(movement) {
  const amountCents = Math.max(0, Math.round(Number(movement?.amountCents || 0)));
  return movement?.kind === "expense" ? -amountCents : amountCents;
}

function formatCurrency(cents) {
  return CURRENCY_FORMATTER.format((Number(cents) || 0) / 100);
}

function formatSignedCurrency(cents) {
  const absoluteValue = formatCurrency(Math.abs(Number(cents) || 0));
  return `${Number(cents) < 0 ? "-" : "+"}${absoluteValue}`;
}

function formatDateLabel(value) {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : LONG_DATE_FORMATTER.format(date);
}

function formatMonthLabel(value) {
  const date = new Date(`${value}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : MONTH_FORMATTER.format(date);
}

function formatDateTimeLabel(value) {
  if (!value) {
    return "Sin registro";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_TIME_FORMATTER.format(date);
}

function formatDenominationLabel(value) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function getPresetById(presetId) {
  return FINANCE_PRESETS.find((entry) => entry.id === presetId) || FINANCE_PRESETS[0];
}

function getMovementStatusLabel(status) {
  return status === "planned" ? "Pendiente" : "Realizado";
}

function getMovementKindLabel(kind) {
  return kind === "income" ? "Ingreso" : "Gasto";
}

function buildCashCountFormState(denominations, sourceCounts = {}) {
  return Object.fromEntries(
    denominations.map((denomination) => [
      String(denomination),
      String(sourceCounts?.[String(denomination)] ?? ""),
    ]),
  );
}

function normalizeCashCountValue(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.round(numericValue));
}

function calculateCashCountTotalCents(denominations, counts) {
  return denominations.reduce((total, denomination) => {
    return total + 100 * normalizeCashCountValue(counts?.[String(denomination)]);
  }, 0);
}

function compareMovementsByDate(left, right) {
  const leftKey = `${left?.movementDate || ""}:${left?.updatedAt || ""}:${left?.createdAt || ""}`;
  const rightKey = `${right?.movementDate || ""}:${right?.updatedAt || ""}:${right?.createdAt || ""}`;
  return leftKey.localeCompare(rightKey);
}

function resolvePeriodStart(period) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (period === "30d") {
    now.setDate(now.getDate() - 29);
    return now;
  }

  if (period === "90d") {
    now.setDate(now.getDate() - 89);
    return now;
  }

  if (period === "365d") {
    now.setDate(now.getDate() - 364);
    return now;
  }

  return null;
}

function isMovementAfterStart(movement, startDate) {
  if (!startDate) {
    return true;
  }

  const movementDate = new Date(`${movement?.movementDate || ""}T00:00:00`);

  if (Number.isNaN(movementDate.getTime())) {
    return false;
  }

  return movementDate >= startDate;
}

function calculatePortfolioSummary(movements) {
  let actualBalanceCents = 0;
  let projectedBalanceCents = 0;
  let plannedExpenseCents = 0;
  let plannedIncomeCents = 0;

  for (const movement of movements) {
    const signedAmount = getSignedAmountCents(movement);

    if (movement?.status === "posted") {
      actualBalanceCents += signedAmount;
      projectedBalanceCents += signedAmount;
      continue;
    }

    projectedBalanceCents += signedAmount;

    if (movement?.kind === "expense") {
      plannedExpenseCents += Math.abs(signedAmount);
    } else {
      plannedIncomeCents += Math.abs(signedAmount);
    }
  }

  return {
    actualBalanceCents,
    projectedBalanceCents,
    plannedExpenseCents,
    plannedIncomeCents,
  };
}

function buildTimelineSeries(movements, period) {
  const startDate = resolvePeriodStart(period);
  const sortedMovements = [...movements].sort(compareMovementsByDate);
  const groupedByDate = new Map();
  let actualSeed = 0;
  let projectedSeed = 0;

  for (const movement of sortedMovements) {
    const signedAmount = getSignedAmountCents(movement);
    const isPosted = movement?.status === "posted";

    if (!isMovementAfterStart(movement, startDate)) {
      projectedSeed += signedAmount;
      if (isPosted) {
        actualSeed += signedAmount;
      }
      continue;
    }

    const dateKey = String(movement?.movementDate || "");
    const bucket = groupedByDate.get(dateKey) || {
      actualDelta: 0,
      projectedDelta: 0,
    };

    bucket.projectedDelta += signedAmount;

    if (isPosted) {
      bucket.actualDelta += signedAmount;
    }

    groupedByDate.set(dateKey, bucket);
  }

  let actualRunningBalance = actualSeed;
  let projectedRunningBalance = projectedSeed;
  const points = [...groupedByDate.entries()].map(([dateKey, bucket]) => {
    actualRunningBalance += bucket.actualDelta;
    projectedRunningBalance += bucket.projectedDelta;

    return {
      date: dateKey,
      actualBalanceCents: actualRunningBalance,
      projectedBalanceCents: projectedRunningBalance,
    };
  });

  return {
    points,
    actualSeed,
    projectedSeed,
  };
}

function buildMonthlyFlowRows(movements, period) {
  const startDate = resolvePeriodStart(period);
  const buckets = new Map();

  for (const movement of movements) {
    if (!isMovementAfterStart(movement, startDate)) {
      continue;
    }

    const movementDate = String(movement?.movementDate || "");
    const monthKey = movementDate.slice(0, 7);

    if (!monthKey) {
      continue;
    }

    const bucket = buckets.get(monthKey) || {
      monthKey,
      postedIncomeCents: 0,
      plannedIncomeCents: 0,
      postedExpenseCents: 0,
      plannedExpenseCents: 0,
    };
    const amountCents = Math.max(0, Number(movement?.amountCents || 0));

    if (movement?.kind === "income") {
      if (movement?.status === "posted") {
        bucket.postedIncomeCents += amountCents;
      } else {
        bucket.plannedIncomeCents += amountCents;
      }
    } else if (movement?.status === "posted") {
      bucket.postedExpenseCents += amountCents;
    } else {
      bucket.plannedExpenseCents += amountCents;
    }

    buckets.set(monthKey, bucket);
  }

  const rows = [...buckets.values()].sort((left, right) =>
    String(left.monthKey).localeCompare(String(right.monthKey)),
  );

  const maxValue = rows.reduce((highest, row) => {
    return Math.max(
      highest,
      row.postedIncomeCents + row.plannedIncomeCents,
      row.postedExpenseCents + row.plannedExpenseCents,
    );
  }, 0);

  return {
    rows,
    maxValue,
  };
}

function buildLinePath(points, valueKey, chartWidth, chartHeight, minValue, maxValue) {
  if (!points.length) {
    return "";
  }

  const safeRange = Math.max(1, maxValue - minValue);
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0;

  return points
    .map((point, index) => {
      const x = points.length > 1 ? index * stepX : chartWidth / 2;
      const y =
        chartHeight - ((Number(point?.[valueKey] || 0) - minValue) / safeRange) * chartHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function BalanceTimelineChart({ points }) {
  if (!points.length) {
    return <div className="financeDashboard__emptyChart">Sin movimientos para graficar en este rango.</div>;
  }

  const allValues = points.flatMap((point) => [
    Number(point.actualBalanceCents || 0),
    Number(point.projectedBalanceCents || 0),
  ]);
  const minValue = Math.min(0, ...allValues);
  const maxValue = Math.max(0, ...allValues);
  const chartWidth = 100;
  const chartHeight = 58;
  const actualPath = buildLinePath(points, "actualBalanceCents", chartWidth, chartHeight, minValue, maxValue);
  const projectedPath = buildLinePath(
    points,
    "projectedBalanceCents",
    chartWidth,
    chartHeight,
    minValue,
    maxValue,
  );
  const zeroY =
    chartHeight - ((0 - minValue) / Math.max(1, maxValue - minValue)) * chartHeight;

  return (
    <div className="financeDashboard__timeline">
      <svg
        className="financeDashboard__timelineSvg"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Evolucion del balance actual y proyectado"
      >
        <line
          x1="0"
          y1={zeroY.toFixed(2)}
          x2={chartWidth}
          y2={zeroY.toFixed(2)}
          className="financeDashboard__timelineAxis"
        />
        <path d={projectedPath} className="financeDashboard__timelineProjected" />
        <path d={actualPath} className="financeDashboard__timelineActual" />
      </svg>

      <div className="financeDashboard__timelineLegend">
        <span>
          <i className="financeDashboard__legendSwatch financeDashboard__legendSwatch--actual" />
          Actual
        </span>
        <span>
          <i className="financeDashboard__legendSwatch financeDashboard__legendSwatch--projected" />
          Proyectado
        </span>
      </div>

      <div className="financeDashboard__timelineTicks">
        <span>{formatDateLabel(points[0]?.date)}</span>
        <span>{formatDateLabel(points.at(-1)?.date)}</span>
      </div>
    </div>
  );
}

function MonthlyFlowChart({ rows, maxValue }) {
  if (!rows.length || !maxValue) {
    return <div className="financeDashboard__emptyChart">Aun no hay flujo suficiente para este rango.</div>;
  }

  return (
    <div className="financeDashboard__flowRows">
      {rows.map((row) => {
        const incomeTotal = row.postedIncomeCents + row.plannedIncomeCents;
        const expenseTotal = row.postedExpenseCents + row.plannedExpenseCents;

        return (
          <div key={row.monthKey} className="financeDashboard__flowRow">
            <div className="financeDashboard__flowMonth">{formatMonthLabel(row.monthKey)}</div>

            <div className="financeDashboard__flowMetric">
              <span className="financeDashboard__flowLabel">Ingresos</span>
              <div className="financeDashboard__flowTrack">
                <span
                  className="financeDashboard__flowFill financeDashboard__flowFill--income"
                  style={{
                    width: `${(Math.max(0, row.postedIncomeCents) / maxValue) * 100}%`,
                  }}
                />
                {row.plannedIncomeCents > 0 ? (
                  <span
                    className="financeDashboard__flowFill financeDashboard__flowFill--incomePlanned"
                    style={{
                      width: `${(Math.max(0, incomeTotal) / maxValue) * 100}%`,
                    }}
                  />
                ) : null}
              </div>
              <span className="financeDashboard__flowValue">{formatCurrency(incomeTotal)}</span>
            </div>

            <div className="financeDashboard__flowMetric">
              <span className="financeDashboard__flowLabel">Gastos</span>
              <div className="financeDashboard__flowTrack">
                <span
                  className="financeDashboard__flowFill financeDashboard__flowFill--expense"
                  style={{
                    width: `${(Math.max(0, row.postedExpenseCents) / maxValue) * 100}%`,
                  }}
                />
                {row.plannedExpenseCents > 0 ? (
                  <span
                    className="financeDashboard__flowFill financeDashboard__flowFill--expensePlanned"
                    style={{
                      width: `${(Math.max(0, expenseTotal) / maxValue) * 100}%`,
                    }}
                  />
                ) : null}
              </div>
              <span className="financeDashboard__flowValue">{formatCurrency(expenseTotal)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MovementRow({ movement, onEdit, onDelete, deleting }) {
  const signedAmountCents = getSignedAmountCents(movement);

  return (
    <div className="financeDashboard__movementRow">
      <div className="financeDashboard__movementMain">
        <div className="financeDashboard__movementTitleRow">
          <strong>{movement?.title || "Movimiento"}</strong>
          <span
            className={[
              "financeDashboard__movementAmount",
              movement?.kind === "income"
                ? "financeDashboard__movementAmount--income"
                : "financeDashboard__movementAmount--expense",
            ].join(" ")}
          >
            {formatSignedCurrency(signedAmountCents)}
          </span>
        </div>

        <div className="financeDashboard__movementMeta">
          <span>{formatDateLabel(movement?.movementDate)}</span>
          <span>{movement?.category || "Sin categoria"}</span>
          <span>{movement?.platform || "Sin plataforma"}</span>
          {movement?.counterparty ? <span>{movement.counterparty}</span> : null}
        </div>

        <div className="financeDashboard__movementPills">
          <span className="financeDashboard__pill">{getMovementKindLabel(movement?.kind)}</span>
          <span className="financeDashboard__pill">{getMovementStatusLabel(movement?.status)}</span>
        </div>

        {movement?.notes ? <p className="financeDashboard__movementNotes">{movement.notes}</p> : null}
      </div>

      <div className="financeDashboard__movementActions">
        <button type="button" className="financeDashboard__iconButton" onClick={onEdit} title="Editar movimiento">
          <PencilIcon size={15} />
        </button>
        <button
          type="button"
          className="financeDashboard__iconButton financeDashboard__iconButton--danger"
          onClick={onDelete}
          disabled={deleting}
          title="Borrar movimiento"
        >
          <TrashIcon size={15} />
        </button>
      </div>
    </div>
  );
}

function CashCountHistoryRow({ cashCount }) {
  const varianceIsPositive = Number(cashCount?.varianceCents || 0) > 0;
  const varianceIsNegative = Number(cashCount?.varianceCents || 0) < 0;

  return (
    <div className="financeDashboard__cashHistoryRow">
      <div className="financeDashboard__cashHistoryMain">
        <strong>{formatDateTimeLabel(cashCount?.countedAt)}</strong>
        <span>
          Contado:
          {" "}
          {formatCurrency(cashCount?.totalCountedCents)}
        </span>
      </div>
      <span
        className={[
          "financeDashboard__cashVariance",
          varianceIsPositive && "financeDashboard__cashVariance--positive",
          varianceIsNegative && "financeDashboard__cashVariance--negative",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {formatSignedCurrency(cashCount?.varianceCents || 0)}
      </span>
    </div>
  );
}

export default function PersonalFinanceView() {
  const titleInputRef = useRef(null);
  const [movements, setMovements] = useState([]);
  const [cashAudit, setCashAudit] = useState({
    counts: [],
    denominations: FINANCE_CASH_DENOMINATIONS,
    latestCashCount: null,
    currentExpectedCents: 0,
    currentCountedCents: null,
    currentVarianceCents: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingCashCount, setSavingCashCount] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [periodFilter, setPeriodFilter] = useState("90d");
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formState, setFormState] = useState(() => buildEmptyFormState());
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [cashCountForm, setCashCountForm] = useState(() =>
    buildCashCountFormState(FINANCE_CASH_DENOMINATIONS),
  );
  const deferredSearchValue = useDeferredValue(searchValue);

  const loadMovements = async () => {
    setError("");
    setRefreshing(true);

    try {
      const response = await ipcRenderer.invoke("finanzas:list");

      if (!response?.ok) {
        throw new Error(response?.error || "No se pudieron cargar los movimientos.");
      }

      startTransition(() => {
        setMovements(Array.isArray(response?.data?.movements) ? response.data.movements : []);
        const nextCashAudit = response?.data?.cashAudit || null;
        const nextDenominations = Array.isArray(nextCashAudit?.denominations) && nextCashAudit.denominations.length
          ? nextCashAudit.denominations
          : FINANCE_CASH_DENOMINATIONS;
        const nextLatestCashCount = nextCashAudit?.latestCashCount || null;

        setCashAudit({
          counts: Array.isArray(nextCashAudit?.counts) ? nextCashAudit.counts : [],
          denominations: nextDenominations,
          latestCashCount: nextLatestCashCount,
          currentExpectedCents: Number(nextCashAudit?.currentExpectedCents || 0),
          currentCountedCents:
            nextCashAudit?.currentCountedCents == null
              ? null
              : Number(nextCashAudit.currentCountedCents),
          currentVarianceCents:
            nextCashAudit?.currentVarianceCents == null
              ? null
              : Number(nextCashAudit.currentVarianceCents),
        });
        setCashCountForm(buildCashCountFormState(nextDenominations, nextLatestCashCount?.counts));
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar los movimientos.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadMovements();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(movements.map((movement) => movement?.category).filter(Boolean))].sort((left, right) =>
      String(left).localeCompare(String(right), undefined, { sensitivity: "base" }),
    );
  }, [movements]);

  const platforms = useMemo(() => {
    return [...new Set(movements.map((movement) => movement?.platform).filter(Boolean))].sort((left, right) =>
      String(left).localeCompare(String(right), undefined, { sensitivity: "base" }),
    );
  }, [movements]);

  const summary = useMemo(() => calculatePortfolioSummary(movements), [movements]);
  const cashDenominations = useMemo(() => {
    return Array.isArray(cashAudit?.denominations) && cashAudit.denominations.length
      ? cashAudit.denominations
      : FINANCE_CASH_DENOMINATIONS;
  }, [cashAudit?.denominations]);

  const queryFilteredMovements = useMemo(() => {
    const normalizedQuery = normalizeSearchText(deferredSearchValue);

    return movements.filter((movement) => {
      if (kindFilter !== "all" && movement?.kind !== kindFilter) {
        return false;
      }

      if (statusFilter !== "all" && movement?.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = normalizeSearchText(
        [
          movement?.title,
          movement?.category,
          movement?.platform,
          movement?.counterparty,
          movement?.notes,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return searchableText.includes(normalizedQuery);
    });
  }, [deferredSearchValue, kindFilter, movements, statusFilter]);

  const visibleMovements = useMemo(() => {
    const startDate = resolvePeriodStart(periodFilter);
    return queryFilteredMovements.filter((movement) => isMovementAfterStart(movement, startDate));
  }, [periodFilter, queryFilteredMovements]);

  const timelineSeries = useMemo(
    () => buildTimelineSeries(queryFilteredMovements, periodFilter),
    [periodFilter, queryFilteredMovements],
  );

  const monthlyFlow = useMemo(
    () => buildMonthlyFlowRows(queryFilteredMovements, periodFilter),
    [periodFilter, queryFilteredMovements],
  );

  const editingMovement = Boolean(formState.id);
  const activePreset = getPresetById(formState.presetId);
  const cashCountPreview = useMemo(() => {
    const totalCountedCents = calculateCashCountTotalCents(cashDenominations, cashCountForm);
    const expectedCents = Number(cashAudit?.currentExpectedCents || 0);

    return {
      totalCountedCents,
      expectedCents,
      varianceCents: totalCountedCents - expectedCents,
    };
  }, [cashAudit?.currentExpectedCents, cashCountForm, cashDenominations]);
  const recentCashCounts = useMemo(
    () => (Array.isArray(cashAudit?.counts) ? cashAudit.counts.slice(0, 4) : []),
    [cashAudit?.counts],
  );

  const updateFormState = (patch) => {
    setFormState((current) => ({
      ...current,
      ...patch,
    }));
  };

  const applyPreset = (presetId) => {
    const preset = getPresetById(presetId);

    setFormState((current) => ({
      ...current,
      presetId: preset.id,
      kind: preset.kind,
      status: preset.status,
    }));

    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
  };

  const resetForm = () => {
    setFormState(buildEmptyFormState(activePreset?.id));
    setShowAdvancedForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const numericAmount = Number(formState.amount);

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error("Ingresa un monto valido mayor a cero.");
      }

      const response = await ipcRenderer.invoke("finanzas:save-movement", {
        id: formState.id || undefined,
        kind: formState.kind,
        status: formState.status,
        title: formState.title,
        amount: numericAmount,
        movementDate: formState.movementDate,
        category: formState.category,
        platform: formState.platform,
        counterparty: formState.counterparty,
        notes: formState.notes,
      });

      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo guardar el movimiento.");
      }

      resetForm();
      await loadMovements();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el movimiento.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditMovement = (movement) => {
    setFormState(buildFormStateFromMovement(movement));
    setShowAdvancedForm(true);
    window.requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });
  };

  const handleDeleteMovement = async (movement) => {
    const movementId = String(movement?.id || "");

    if (!movementId) {
      return;
    }

    const confirmed = window.confirm(`Borrar "${movement?.title || "este movimiento"}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(movementId);
    setError("");

    try {
      const response = await ipcRenderer.invoke("finanzas:delete-movement", {
        id: movementId,
      });

      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo borrar el movimiento.");
      }

      if (formState.id === movementId) {
        resetForm();
      }

      await loadMovements();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo borrar el movimiento.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const handleCashCountFieldChange = (denomination, nextValue) => {
    setCashCountForm((current) => ({
      ...current,
      [String(denomination)]: nextValue,
    }));
  };

  const handleSaveCashCount = async () => {
    setSavingCashCount(true);
    setError("");

    try {
      const countsPayload = Object.fromEntries(
        cashDenominations.map((denomination) => [
          String(denomination),
          normalizeCashCountValue(cashCountForm[String(denomination)]),
        ]),
      );

      const response = await ipcRenderer.invoke("finanzas:save-cash-count", {
        counts: countsPayload,
      });

      if (!response?.ok) {
        throw new Error(response?.error || "No se pudo guardar el arqueo.");
      }

      await loadMovements();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el arqueo de efectivo.",
      );
    } finally {
      setSavingCashCount(false);
    }
  };

  const hasAnyMovement = movements.length > 0;
  const cashVarianceIsPositive = cashCountPreview.varianceCents > 0;
  const cashVarianceIsNegative = cashCountPreview.varianceCents < 0;

  return (
    <div className="financeDashboard">
      <div className="financeDashboard__content">
        <div className="financeDashboard__heroGrid">
          <section className="financeDashboard__panel financeDashboard__panel--composer">
            <div className="financeDashboard__panelHeader">
              <div>
                <strong>{editingMovement ? "Editar movimiento" : "Nuevo movimiento"}</strong>
              </div>
            </div>

            <div className="financeDashboard__presetGrid" role="tablist" aria-label="Tipo de movimiento">
              {FINANCE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={[
                    "financeDashboard__presetButton",
                    formState.presetId === preset.id && "is-active",
                    preset.kind === "income"
                      ? "financeDashboard__presetButton--income"
                      : "financeDashboard__presetButton--expense",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => applyPreset(preset.id)}
                >
                  {preset.kind === "income" ? <ArrowInIcon size={16} /> : <ArrowOutIcon size={16} />}
                  <span>{preset.shortLabel}</span>
                </button>
              ))}
            </div>

            <form className="financeDashboard__form" onSubmit={handleSubmit}>
              <label className="financeDashboard__field financeDashboard__field--wide">
                <span>Titulo</span>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={formState.title}
                  onChange={(event) => updateFormState({ title: event.target.value })}
                  placeholder={
                    activePreset.kind === "income"
                      ? "Ej. Sueldo, venta, transferencia"
                      : "Ej. Supermercado, alquiler, cuota"
                  }
                  required
                />
              </label>

              <label className="financeDashboard__field financeDashboard__field--amount">
                <span>Monto</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={formState.amount}
                  onChange={(event) => updateFormState({ amount: event.target.value })}
                  placeholder="0.00"
                  required
                />
              </label>

              {showAdvancedForm ? (
                <>
                  <label className="financeDashboard__field">
                    <span>Fecha</span>
                    <input
                      type="date"
                      value={formState.movementDate}
                      onChange={(event) => updateFormState({ movementDate: event.target.value })}
                      required
                    />
                  </label>

                  <label className="financeDashboard__field">
                    <span>Categoria</span>
                    <input
                      type="text"
                      list="finanzas-categories"
                      value={formState.category}
                      onChange={(event) => updateFormState({ category: event.target.value })}
                      placeholder="Comida, transporte, sueldo..."
                    />
                  </label>

                  <label className="financeDashboard__field">
                    <span>Plataforma</span>
                    <input
                      type="text"
                      list="finanzas-platforms"
                      value={formState.platform}
                      onChange={(event) => updateFormState({ platform: event.target.value })}
                      placeholder="Efectivo, Mercado Pago, banco..."
                    />
                  </label>

                  <label className="financeDashboard__field financeDashboard__field--wide">
                    <span>Origen / lugar</span>
                    <input
                      type="text"
                      value={formState.counterparty}
                      onChange={(event) => updateFormState({ counterparty: event.target.value })}
                      placeholder="Comercio, persona, empresa o contexto"
                    />
                  </label>

                  <label className="financeDashboard__field financeDashboard__field--wide">
                    <span>Notas</span>
                    <textarea
                      rows="3"
                      value={formState.notes}
                      onChange={(event) => updateFormState({ notes: event.target.value })}
                      placeholder="Detalle opcional"
                    />
                  </label>
                </>
              ) : null}

              <div className="financeDashboard__formActions">
                <button type="submit" className="financeDashboard__primaryButton" disabled={saving}>
                  {saving ? "Guardando..." : editingMovement ? "Guardar cambios" : "Agregar movimiento"}
                </button>

                <button
                  type="button"
                  className="financeDashboard__secondaryButton"
                  onClick={() => setShowAdvancedForm((current) => !current)}
                  disabled={saving}
                >
                  {showAdvancedForm ? "Ocultar formulario completo" : "Mostrar formulario completo"}
                </button>

                {editingMovement ? (
                  <button
                    type="button"
                    className="financeDashboard__secondaryButton"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancelar edicion
                  </button>
                ) : null}
              </div>
            </form>

            <datalist id="finanzas-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>

            <datalist id="finanzas-platforms">
              {platforms.map((platform) => (
                <option key={platform} value={platform} />
              ))}
            </datalist>
          </section>

          <section className="financeDashboard__summaryStack">
            <div className="financeDashboard__summaryCard financeDashboard__summaryCard--actual">
              <span className="financeDashboard__panelEyebrow">Saldo actual</span>
              <strong>{formatCurrency(summary.actualBalanceCents)}</strong>
              <p>
                Basado solo en movimientos realizados. Pendientes cargados:
                {" "}
                {formatCurrency(summary.plannedIncomeCents)}
                {" "}
                de ingresos y
                {" "}
                {formatCurrency(summary.plannedExpenseCents)}
                {" "}
                de gastos.
              </p>
            </div>

            <div className="financeDashboard__summaryCard financeDashboard__summaryCard--projected">
              <span className="financeDashboard__panelEyebrow">Saldo proyectado</span>
              <strong>{formatCurrency(summary.projectedBalanceCents)}</strong>
              <p>
                Resultado esperado si se ejecutan todos los pendientes ya cargados.
              </p>
            </div>

            <section className="financeDashboard__panel financeDashboard__panel--cash">
              <div className="financeDashboard__panelHeader">
                <div>
                  <strong>Efectivo</strong>
                </div>
              </div>

              <p className="financeDashboard__cashCopy">
                Arqueo por monto agrupado por denominacion para contrastar el efectivo contado contra lo esperado por movimientos realizados con plataforma
                {" "}
                `Efectivo`.
              </p>

              <div className="financeDashboard__cashStats">
                <div className="financeDashboard__cashStat">
                  <span>Esperado</span>
                  <strong>{formatCurrency(cashCountPreview.expectedCents)}</strong>
                </div>

                <div className="financeDashboard__cashStat">
                  <span>Contado</span>
                  <strong>{formatCurrency(cashCountPreview.totalCountedCents)}</strong>
                </div>

                <div className="financeDashboard__cashStat">
                  <span>Diferencia</span>
                  <strong
                    className={[
                      cashVarianceIsPositive && "financeDashboard__cashVariance--positive",
                      cashVarianceIsNegative && "financeDashboard__cashVariance--negative",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {formatSignedCurrency(cashCountPreview.varianceCents)}
                  </strong>
                </div>
              </div>

              <div className="financeDashboard__cashGrid">
                {cashDenominations.map((denomination) => (
                  <label key={denomination} className="financeDashboard__cashField">
                    <span>{`${formatDenominationLabel(denomination)} ARS`}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={cashCountForm[String(denomination)] ?? ""}
                      onChange={(event) =>
                        handleCashCountFieldChange(denomination, event.target.value)
                      }
                      placeholder="0"
                    />
                  </label>
                ))}
              </div>

              <div className="financeDashboard__formActions">
                <button
                  type="button"
                  className="financeDashboard__primaryButton"
                  onClick={() => void handleSaveCashCount()}
                  disabled={savingCashCount}
                >
                  {savingCashCount ? "Guardando arqueo..." : "Registrar arqueo"}
                </button>
              </div>

              {cashAudit?.latestCashCount ? (
                <div className="financeDashboard__cashHint">
                  Ultimo arqueo:
                  {" "}
                  {formatDateTimeLabel(cashAudit.latestCashCount.countedAt)}
                </div>
              ) : (
                <div className="financeDashboard__cashHint">
                  Todavia no hay arqueos registrados. El primero te deja ver si el efectivo real coincide con lo cargado.
                </div>
              )}

              {recentCashCounts.length ? (
                <div className="financeDashboard__cashHistory">
                  {recentCashCounts.map((cashCount) => (
                    <CashCountHistoryRow key={cashCount.id} cashCount={cashCount} />
                  ))}
                </div>
              ) : null}
            </section>
          </section>
        </div>

        <section className="financeDashboard__filtersBar">
          <label className="financeDashboard__inlineField financeDashboard__inlineField--search">
            <span>Buscar</span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Titulo, categoria, plataforma o nota"
            />
          </label>

          <label className="financeDashboard__inlineField">
            <span>Periodo</span>
            <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)}>
              {FINANCE_PERIOD_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="financeDashboard__inlineField">
            <span>Tipo</span>
            <select value={kindFilter} onChange={(event) => setKindFilter(event.target.value)}>
              <option value="all">Todos</option>
              <option value="expense">Gastos</option>
              <option value="income">Ingresos</option>
            </select>
          </label>

          <label className="financeDashboard__inlineField">
            <span>Estado</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Todos</option>
              <option value="posted">Realizados</option>
              <option value="planned">Pendientes</option>
            </select>
          </label>
        </section>

        <div className="financeDashboard__chartsGrid">
          <section className="financeDashboard__panel">
            <div className="financeDashboard__panelHeader">
              <div>
                <span className="financeDashboard__panelEyebrow">Grafico</span>
                <strong>Nivel de dinero en el tiempo</strong>
              </div>
              <WalletIcon size={18} />
            </div>
            <BalanceTimelineChart points={timelineSeries.points} />
          </section>

          <section className="financeDashboard__panel">
            <div className="financeDashboard__panelHeader">
              <div>
                <span className="financeDashboard__panelEyebrow">Flujo</span>
                <strong>Ingresos y egresos por mes</strong>
              </div>
            </div>
            <MonthlyFlowChart rows={monthlyFlow.rows} maxValue={monthlyFlow.maxValue} />
          </section>
        </div>

        <section className="financeDashboard__panel financeDashboard__panel--history">
          <div className="financeDashboard__panelHeader">
            <div>
              <strong>Movimientos</strong>
            </div>
            <div className="financeDashboard__panelHeaderActions">
              <span className="financeDashboard__historyCount">
                {visibleMovements.length}
                {" "}
                visibles
              </span>
              <button
                type="button"
                className="financeDashboard__iconButton"
                onClick={() => void loadMovements()}
                disabled={refreshing}
                title="Recargar movimientos"
              >
                <RefreshIcon size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="financeDashboard__state">Cargando movimientos...</div>
          ) : !hasAnyMovement ? (
            <div className="financeDashboard__state">
              Aun no hay movimientos. Empieza con un gasto o ingreso desde el panel superior.
            </div>
          ) : visibleMovements.length === 0 ? (
            <div className="financeDashboard__state">
              No hay movimientos que coincidan con los filtros actuales.
            </div>
          ) : (
            <div className="financeDashboard__movementList">
              {visibleMovements.map((movement) => (
                <MovementRow
                  key={movement.id}
                  movement={movement}
                  deleting={deletingId === movement.id}
                  onEdit={() => handleEditMovement(movement)}
                  onDelete={() => void handleDeleteMovement(movement)}
                />
              ))}
            </div>
          )}
        </section>

        {error ? <div className="financeDashboard__state financeDashboard__state--error">{error}</div> : null}
      </div>
    </div>
  );
}
