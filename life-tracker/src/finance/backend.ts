import { randomUUID } from "node:crypto";
import type {
  NexusBackendPluginContext,
  NexusBackendPluginModule,
} from "../../../../nexus-backend/src/plugins/types.ts";
import {
  FINANCE_CASH_DENOMINATIONS,
  FINANCE_MOVEMENT_KINDS,
  FINANCE_MOVEMENT_STATUSES,
} from "./constants.js";

const LIFE_TRACKER_FINANCE_CHANNEL_PREFIX = "life-tracker:finance";

type FinanceMovementRecord = {
  id: string;
  kind: string;
  status: string;
  amountCents: number;
  movementDate: string;
  title: string;
  category: string | null;
  platform: string | null;
  counterparty: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type FinanceCashCountsShape = Record<string, number>;

type FinanceCashCountRecord = {
  id: string;
  countedAt: string;
  counts: FinanceCashCountsShape;
  totalCountedCents: number;
  expectedCents: number;
  varianceCents: number;
  createdAt: string;
};

function createSuccess(data: unknown) {
  return {
    ok: true,
    data,
  };
}

function createError(error: unknown, fallbackMessage: string) {
  return {
    ok: false,
    error: error instanceof Error ? error.message : fallbackMessage,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function todayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function normalizeMovementKind(value: unknown) {
  const normalized = String(value || "").trim().toLowerCase();
  return FINANCE_MOVEMENT_KINDS.includes(normalized) ? normalized : "expense";
}

function normalizeMovementStatus(value: unknown) {
  const normalized = String(value || "").trim().toLowerCase();
  return FINANCE_MOVEMENT_STATUSES.includes(normalized) ? normalized : "posted";
}

function normalizeMovementDate(value: unknown) {
  const normalized = String(value || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return normalized;
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return todayLocalDate();
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeAmountCents(payload: any) {
  if (Number.isFinite(Number(payload?.amountCents))) {
    return Math.max(0, Math.round(Number(payload.amountCents)));
  }

  if (Number.isFinite(Number(payload?.amount))) {
    return Math.max(0, Math.round(Number(payload.amount) * 100));
  }

  const rawValue = String(payload?.amount ?? "").trim();

  if (!rawValue) {
    return 0;
  }

  const normalized = rawValue
    .replace(/\s+/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");

  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue * 100)) : 0;
}

function normalizeComparableText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isCashPlatform(value: unknown) {
  const normalized = normalizeComparableText(value);

  if (!normalized) {
    return false;
  }

  return (
    normalized === "efectivo" ||
    normalized === "cash" ||
    normalized === "caja" ||
    normalized.startsWith("efectivo ") ||
    normalized.includes(" efectivo")
  );
}

function getSignedAmountCents(movement: FinanceMovementRecord | null | undefined) {
  const amountCents = Math.max(0, Math.round(Number(movement?.amountCents || 0)));
  return movement?.kind === "expense" ? -amountCents : amountCents;
}

function getCashMovementDeltaCents(movement: FinanceMovementRecord | null | undefined) {
  if (!movement || movement.status !== "posted" || !isCashPlatform(movement.platform)) {
    return 0;
  }

  return getSignedAmountCents(movement);
}

function normalizeMovementRow(row: any): FinanceMovementRecord | null {
  if (!row?.id) {
    return null;
  }

  return {
    id: String(row.id),
    kind: normalizeMovementKind(row.kind),
    status: normalizeMovementStatus(row.status),
    amountCents: Math.max(0, Math.round(Number(row.amount_cents || 0))),
    movementDate: normalizeMovementDate(row.movement_date),
    title: String(row.title || "").trim() || "Movimiento",
    category: normalizeOptionalText(row.category),
    platform: normalizeOptionalText(row.platform),
    counterparty: normalizeOptionalText(row.counterparty),
    notes: normalizeOptionalText(row.notes),
    createdAt: String(row.created_at || nowIso()),
    updatedAt: String(row.updated_at || row.created_at || nowIso()),
  };
}

function buildEmptyCashCounts() {
  return Object.fromEntries(
    FINANCE_CASH_DENOMINATIONS.map((denomination) => [String(denomination), 0]),
  ) satisfies FinanceCashCountsShape;
}

function normalizeCashBucketAmount(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.round(numericValue));
}

function normalizeCashCounts(value: unknown) {
  const nextCounts = buildEmptyCashCounts();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return nextCounts;
  }

  for (const denomination of FINANCE_CASH_DENOMINATIONS) {
    nextCounts[String(denomination)] = normalizeCashBucketAmount((value as any)?.[String(denomination)]);
  }

  return nextCounts;
}

function parseCashCountsJson(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return buildEmptyCashCounts();
  }

  try {
    return normalizeCashCounts(JSON.parse(value));
  } catch {
    return buildEmptyCashCounts();
  }
}

function calculateCashCountsTotalCents(counts: FinanceCashCountsShape) {
  return FINANCE_CASH_DENOMINATIONS.reduce((total, denomination) => {
    return total + 100 * normalizeCashBucketAmount(counts[String(denomination)]);
  }, 0);
}

function normalizeCashCountRow(row: any): FinanceCashCountRecord | null {
  if (!row?.id) {
    return null;
  }

  const counts = parseCashCountsJson(row.counts_json);
  const totalCountedCents = Math.max(
    0,
    Math.round(Number(row.total_counted_cents ?? calculateCashCountsTotalCents(counts))),
  );
  const expectedCents = Math.round(Number(row.expected_cents || 0));
  const varianceCents = Math.round(Number(row.variance_cents || 0));

  return {
    id: String(row.id),
    countedAt: String(row.counted_at || row.created_at || nowIso()),
    counts,
    totalCountedCents,
    expectedCents,
    varianceCents,
    createdAt: String(row.created_at || nowIso()),
  };
}

function ensureFinanceSchema(sqlite: any) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS finance_movements (
      id TEXT PRIMARY KEY NOT NULL,
      kind TEXT NOT NULL,
      status TEXT NOT NULL,
      amount_cents INTEGER NOT NULL,
      movement_date TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT,
      platform TEXT,
      counterparty TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_finance_movements_date ON finance_movements (movement_date DESC, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_finance_movements_kind_status ON finance_movements (kind, status);
    CREATE INDEX IF NOT EXISTS idx_finance_movements_category ON finance_movements (category);
    CREATE INDEX IF NOT EXISTS idx_finance_movements_platform ON finance_movements (platform);

    CREATE TABLE IF NOT EXISTS finance_cash_counts (
      id TEXT PRIMARY KEY NOT NULL,
      counted_at TEXT NOT NULL,
      counts_json TEXT NOT NULL,
      total_counted_cents INTEGER NOT NULL,
      expected_cents INTEGER NOT NULL,
      variance_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_finance_cash_counts_counted_at ON finance_cash_counts (counted_at DESC, created_at DESC);
  `);
}

function listMovementsSync(sqlite: any) {
  return sqlite.prepare(`
    SELECT *
    FROM finance_movements
    ORDER BY movement_date DESC, updated_at DESC, created_at DESC, title COLLATE NOCASE ASC
  `).all()
    .map((row: any) => normalizeMovementRow(row))
    .filter(Boolean);
}

function listCashCountsSync(sqlite: any) {
  return sqlite.prepare(`
    SELECT *
    FROM finance_cash_counts
    ORDER BY counted_at DESC, created_at DESC
  `).all()
    .map((row: any) => normalizeCashCountRow(row))
    .filter(Boolean);
}

function findMovementByIdSync(sqlite: any, movementId: string) {
  return normalizeMovementRow(
    sqlite.prepare(`
      SELECT *
      FROM finance_movements
      WHERE id = ?
      LIMIT 1
    `).get(movementId),
  );
}

function saveMovementSync(sqlite: any, payload: FinanceMovementRecord) {
  sqlite.prepare(`
    INSERT INTO finance_movements (
      id,
      kind,
      status,
      amount_cents,
      movement_date,
      title,
      category,
      platform,
      counterparty,
      notes,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @kind,
      @status,
      @amount_cents,
      @movement_date,
      @title,
      @category,
      @platform,
      @counterparty,
      @notes,
      @created_at,
      @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      kind = excluded.kind,
      status = excluded.status,
      amount_cents = excluded.amount_cents,
      movement_date = excluded.movement_date,
      title = excluded.title,
      category = excluded.category,
      platform = excluded.platform,
      counterparty = excluded.counterparty,
      notes = excluded.notes,
      updated_at = excluded.updated_at
  `).run({
    id: payload.id,
    kind: payload.kind,
    status: payload.status,
    amount_cents: payload.amountCents,
    movement_date: payload.movementDate,
    title: payload.title,
    category: payload.category,
    platform: payload.platform,
    counterparty: payload.counterparty,
    notes: payload.notes,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt,
  });
}

function saveCashCountSync(sqlite: any, payload: FinanceCashCountRecord) {
  sqlite.prepare(`
    INSERT INTO finance_cash_counts (
      id,
      counted_at,
      counts_json,
      total_counted_cents,
      expected_cents,
      variance_cents,
      created_at
    ) VALUES (
      @id,
      @counted_at,
      @counts_json,
      @total_counted_cents,
      @expected_cents,
      @variance_cents,
      @created_at
    )
  `).run({
    id: payload.id,
    counted_at: payload.countedAt,
    counts_json: JSON.stringify(payload.counts),
    total_counted_cents: payload.totalCountedCents,
    expected_cents: payload.expectedCents,
    variance_cents: payload.varianceCents,
    created_at: payload.createdAt,
  });
}

function deleteMovementSync(sqlite: any, movementId: string) {
  sqlite.prepare("DELETE FROM finance_movements WHERE id = ?").run(movementId);
}

function normalizeMovementPayload(payload: any, existing: FinanceMovementRecord | null) {
  const title = String(payload?.title || "").trim();

  if (!title) {
    throw new Error("El movimiento necesita un titulo.");
  }

  const amountCents = normalizeAmountCents(payload);

  if (!amountCents) {
    throw new Error("El movimiento necesita un monto mayor a cero.");
  }

  const createdAt = existing?.createdAt || nowIso();

  return {
    id: String(payload?.id || existing?.id || randomUUID()),
    kind: normalizeMovementKind(payload?.kind ?? existing?.kind),
    status: normalizeMovementStatus(payload?.status ?? existing?.status),
    amountCents,
    movementDate: normalizeMovementDate(payload?.movementDate ?? existing?.movementDate),
    title,
    category: normalizeOptionalText(payload?.category ?? existing?.category),
    platform: normalizeOptionalText(payload?.platform ?? existing?.platform),
    counterparty: normalizeOptionalText(payload?.counterparty ?? existing?.counterparty),
    notes: normalizeOptionalText(payload?.notes ?? existing?.notes),
    createdAt,
    updatedAt: nowIso(),
  } satisfies FinanceMovementRecord;
}

function getCashAuditSummary(
  movements: FinanceMovementRecord[],
  cashCounts: FinanceCashCountRecord[],
) {
  const latestCashCount = cashCounts[0] || null;

  if (!latestCashCount) {
    const expectedWithoutBaselineCents = movements.reduce((total, movement) => {
      return total + getCashMovementDeltaCents(movement);
    }, 0);

    return {
      latestCashCount: null,
      currentExpectedCents: expectedWithoutBaselineCents,
      currentCountedCents: null,
      currentVarianceCents: null,
    };
  }

  const movementDeltaSinceLatestCountCents = movements.reduce((total, movement) => {
    return total + (
      String(movement?.updatedAt || movement?.createdAt || "") > latestCashCount.createdAt
        ? getCashMovementDeltaCents(movement)
        : 0
    );
  }, 0);

  const currentExpectedCents =
    latestCashCount.totalCountedCents + movementDeltaSinceLatestCountCents;

  return {
    latestCashCount,
    currentExpectedCents,
    currentCountedCents: latestCashCount.totalCountedCents,
    currentVarianceCents: latestCashCount.totalCountedCents - currentExpectedCents,
  };
}

export function registerFinanceSchema(ctx: NexusBackendPluginContext) {
  ensureFinanceSchema(ctx.requireRepositories().sqlite);
}

export async function listFinanceDashboard(ctx: NexusBackendPluginContext) {
  const sqlite = ctx.requireRepositories().sqlite;
  const movements = listMovementsSync(sqlite);
  const cashCounts = listCashCountsSync(sqlite);
  const cashAudit = getCashAuditSummary(movements, cashCounts);

  return {
    movements,
    cashAudit: {
      ...cashAudit,
      counts: cashCounts,
      denominations: FINANCE_CASH_DENOMINATIONS,
    },
  };
}

export async function saveFinanceMovement(ctx: NexusBackendPluginContext, payload: any) {
  const sqlite = ctx.requireRepositories().sqlite;
  const requestedId = String(payload?.id || "").trim();
  const existing = requestedId ? findMovementByIdSync(sqlite, requestedId) : null;
  const normalizedMovement = normalizeMovementPayload(payload, existing);
  saveMovementSync(sqlite, normalizedMovement);
  return findMovementByIdSync(sqlite, normalizedMovement.id);
}

export async function saveFinanceCashCount(ctx: NexusBackendPluginContext, payload: any) {
  const sqlite = ctx.requireRepositories().sqlite;
  const movements = listMovementsSync(sqlite);
  const cashCounts = listCashCountsSync(sqlite);
  const summary = getCashAuditSummary(movements, cashCounts);
  const counts = normalizeCashCounts(payload?.counts);
  const totalCountedCents = calculateCashCountsTotalCents(counts);
  const expectedCents = summary.currentExpectedCents;
  const varianceCents = totalCountedCents - expectedCents;
  const countedAt = nowIso();

  const normalizedCashCount = {
    id: randomUUID(),
    countedAt,
    counts,
    totalCountedCents,
    expectedCents,
    varianceCents,
    createdAt: countedAt,
  } satisfies FinanceCashCountRecord;

  saveCashCountSync(sqlite, normalizedCashCount);
  return normalizedCashCount;
}

export async function deleteFinanceMovement(ctx: NexusBackendPluginContext, movementId: string) {
  const sqlite = ctx.requireRepositories().sqlite;
  const normalizedId = String(movementId || "").trim();

  if (!normalizedId) {
    throw new Error("Falta el id del movimiento.");
  }

  const existing = findMovementByIdSync(sqlite, normalizedId);

  if (!existing) {
    throw new Error("No se encontro el movimiento a borrar.");
  }

  deleteMovementSync(sqlite, normalizedId);
  return {
    id: normalizedId,
  };
}

const lifeTrackerFinancePlugin: NexusBackendPluginModule = {
  ensureSchema(ctx) {
    registerFinanceSchema(ctx);
  },

  activate(ctx) {
    ctx.registerIpc(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:list`, async () => {
      try {
        return createSuccess(await listFinanceDashboard(ctx));
      } catch (error) {
        return createError(error, "No se pudieron cargar los datos de finanzas.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:save-movement`, async (_event, payload: any) => {
      try {
        return createSuccess({
          movement: await saveFinanceMovement(ctx, payload),
        });
      } catch (error) {
        return createError(error, "No se pudo guardar el movimiento.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:save-cash-count`, async (_event, payload: any) => {
      try {
        return createSuccess({
          cashCount: await saveFinanceCashCount(ctx, payload),
        });
      } catch (error) {
        return createError(error, "No se pudo guardar el arqueo de efectivo.");
      }
    });

    ctx.registerIpc(`${LIFE_TRACKER_FINANCE_CHANNEL_PREFIX}:delete-movement`, async (_event, payload: any) => {
      try {
        const movementId =
          typeof payload === "string"
            ? payload
            : String(payload?.id || "");

        return createSuccess({
          deleted: await deleteFinanceMovement(ctx, movementId),
        });
      } catch (error) {
        return createError(error, "No se pudo borrar el movimiento.");
      }
    });
  },
};

export default lifeTrackerFinancePlugin;
