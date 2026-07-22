const BOORU_WORKSPACE_SECTIONS = Object.freeze([
  "media",
  "pending",
  "authors",
  "characters",
  "artists",
  "universes",
  "settings",
]);

const BOORU_ENTITY_SECTION_KIND = Object.freeze({
  authors: "author",
  characters: "character",
  artists: "artist",
  universes: "universe",
});

const BOORU_SETTINGS_SUBVIEWS = new Set(["overview", "duplicates", "trash"]);

export const BOORU_NAVIGATION_INPUT_KEY = "booruNavigation";

export const BOORU_GRID_FAMILIES = Object.freeze({
  RESOURCES: "resources",
  ENTITIES: "entities",
  PROFILE_RESOURCES: "profileResources",
});

export const BOORU_GRID_COLUMN_LIMITS = Object.freeze({ min: 2, max: 12 });

export const BOORU_DEFAULT_GRID_COLUMNS = Object.freeze({
  [BOORU_GRID_FAMILIES.RESOURCES]: 6,
  [BOORU_GRID_FAMILIES.ENTITIES]: 5,
  [BOORU_GRID_FAMILIES.PROFILE_RESOURCES]: 6,
});

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeSection(value) {
  const section = normalizeText(value);
  return BOORU_WORKSPACE_SECTIONS.includes(section) ? section : "media";
}

function normalizeProfile(value, section) {
  const expectedKind = BOORU_ENTITY_SECTION_KIND[section] || null;
  const kind = normalizeText(value?.kind);
  const id = normalizeText(value?.id);
  const tab = normalizeText(value?.tab) || "gallery";

  if (!expectedKind || kind !== expectedKind || !id) {
    return null;
  }

  return { kind, id, tab };
}

export function normalizeBooruWorkspaceRoute(value = null) {
  const section = normalizeSection(value?.section);
  const settingsSubview = section === "settings" && BOORU_SETTINGS_SUBVIEWS.has(normalizeText(value?.settingsSubview))
    ? normalizeText(value?.settingsSubview)
    : "overview";

  return {
    section,
    settingsSubview,
    entityKind: BOORU_ENTITY_SECTION_KIND[section] || null,
    profile: normalizeProfile(value?.entityProfile || value?.profile, section),
  };
}

export function createBooruWorkspaceRouteKey(value = null) {
  const route = normalizeBooruWorkspaceRoute(value);

  if (route.section === "settings") {
    return `settings:${route.settingsSubview}`;
  }

  if (route.profile) {
    return `${route.section}:${route.profile.id}:${route.profile.tab}`;
  }

  return `${route.section}:root`;
}

export function createBooruSectionRootRoute(section) {
  return normalizeBooruWorkspaceRoute({ section, settingsSubview: "overview", entityProfile: null });
}

export function routeToBooruWorkspaceInput(routeValue, baseInput = null, navigation = null) {
  const route = normalizeBooruWorkspaceRoute(routeValue);
  const nextInput = {
    ...(baseInput && typeof baseInput === "object" ? baseInput : {}),
    section: route.section,
    settingsSubview: route.settingsSubview,
    entityProfile: route.profile ? { ...route.profile } : null,
  };

  if (navigation) {
    nextInput[BOORU_NAVIGATION_INPUT_KEY] = normalizeBooruNavigationState(navigation, route);
  }

  return nextInput;
}

export function normalizeBooruNavigationState(value = null, activeRouteValue = null) {
  const activeRoute = normalizeBooruWorkspaceRoute(activeRouteValue || value?.activeRoute);
  const rawStack = Array.isArray(value?.backStack) ? value.backStack : [];
  const backStack = [];

  for (const candidate of rawStack) {
    const route = normalizeBooruWorkspaceRoute(candidate);
    if (createBooruWorkspaceRouteKey(route) === createBooruWorkspaceRouteKey(activeRoute)) {
      continue;
    }
    if (!backStack.length || createBooruWorkspaceRouteKey(backStack.at(-1)) !== createBooruWorkspaceRouteKey(route)) {
      backStack.push(route);
    }
  }

  return { activeRoute, backStack };
}

export function pushBooruWorkspaceRoute(navigationValue, nextRouteValue) {
  const navigation = normalizeBooruNavigationState(navigationValue);
  const nextRoute = normalizeBooruWorkspaceRoute(nextRouteValue);
  const currentKey = createBooruWorkspaceRouteKey(navigation.activeRoute);
  const nextKey = createBooruWorkspaceRouteKey(nextRoute);

  if (currentKey === nextKey) {
    return { ...navigation, activeRoute: nextRoute };
  }

  return normalizeBooruNavigationState({
    activeRoute: nextRoute,
    backStack: [...navigation.backStack, navigation.activeRoute],
  }, nextRoute);
}

export function replaceBooruWorkspaceRoute(navigationValue, nextRouteValue) {
  const navigation = normalizeBooruNavigationState(navigationValue);
  const nextRoute = normalizeBooruWorkspaceRoute(nextRouteValue);
  return normalizeBooruNavigationState({ ...navigation, activeRoute: nextRoute }, nextRoute);
}

export async function popBooruWorkspaceRoute(navigationValue, isRouteAvailable = null) {
  const navigation = normalizeBooruNavigationState(navigationValue);
  const remaining = [...navigation.backStack];

  while (remaining.length) {
    const candidate = remaining.pop();
    const available = typeof isRouteAvailable !== "function" || await isRouteAvailable(candidate);

    if (available) {
      return normalizeBooruNavigationState({ activeRoute: candidate, backStack: remaining }, candidate);
    }

    const ancestor = createBooruSectionRootRoute(candidate.section);
    const ancestorAvailable = typeof isRouteAvailable !== "function" || await isRouteAvailable(ancestor);
    if (ancestorAvailable) {
      return normalizeBooruNavigationState({ activeRoute: ancestor, backStack: remaining }, ancestor);
    }
  }

  const fallback = createBooruSectionRootRoute(navigation.activeRoute.section);
  return normalizeBooruNavigationState({ activeRoute: fallback, backStack: [] }, fallback);
}

export function resetBooruWorkspaceSection(navigationValue, section) {
  const root = createBooruSectionRootRoute(section);
  const navigation = normalizeBooruNavigationState(navigationValue, root);
  return {
    activeRoute: root,
    backStack: navigation.backStack.filter((route) => route.section !== root.section),
  };
}

function clampColumns(value, fallback) {
  const numericValue = Number(value);
  const normalizedValue = Number.isFinite(numericValue) ? Math.round(numericValue) : fallback;
  return Math.min(BOORU_GRID_COLUMN_LIMITS.max, Math.max(BOORU_GRID_COLUMN_LIMITS.min, normalizedValue));
}

export function normalizeBooruGridPreferences(value = null) {
  return Object.fromEntries(
    Object.entries(BOORU_DEFAULT_GRID_COLUMNS).map(([family, fallback]) => [
      family,
      clampColumns(value?.[family], fallback),
    ]),
  );
}

export function stepBooruGridColumns(value, family, deltaY) {
  const preferences = normalizeBooruGridPreferences(value);
  if (!Object.hasOwn(BOORU_DEFAULT_GRID_COLUMNS, family) || !Number(deltaY)) {
    return preferences;
  }

  const direction = Number(deltaY) < 0 ? -1 : 1;
  return {
    ...preferences,
    [family]: clampColumns(preferences[family] + direction, BOORU_DEFAULT_GRID_COLUMNS[family]),
  };
}

export function createEmptyBooruRouteSession() {
  return {
    query: null,
    filters: null,
    order: null,
    direction: null,
    grouping: null,
    groupBy: null,
    groupOrderBy: null,
    results: null,
    selection: null,
    scrollTop: 0,
  };
}

export function createBooruResourceRouteSession(routeValue, searchTokens = []) {
  const route = normalizeBooruWorkspaceRoute(routeValue);
  return {
    ...createEmptyBooruRouteSession(),
    route,
    query: Array.isArray(searchTokens) ? searchTokens.filter(Boolean) : [],
    filters: {
      mediaKind: "all",
      reality: "all",
      missing: "none",
      pendingMode: "essential",
    },
    results: {
      items: [],
      totalCount: 0,
      hasMore: false,
      querySignature: "",
    },
    page: { page: 1, querySignature: "" },
    selection: { ids: [], activeId: "", mode: "single" },
  };
}

export function resolveBooruProfileForRoute(routeValue, sessionProfile = null, currentProfile = null) {
  const route = normalizeBooruWorkspaceRoute(routeValue);
  if (!route.profile) return null;

  return [currentProfile, sessionProfile].find((candidate) => (
    String(candidate?.kind || "").trim() === route.profile.kind
    && String(candidate?.id || "").trim() === route.profile.id
  )) || null;
}
