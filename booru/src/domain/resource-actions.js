const UNIVERSAL_IMAGE_ACTIONS = Object.freeze([
  { id: "copy", label: "Copiar al portapapeles" },
  { id: "google", label: "Buscar en Google" },
]);

export function buildBooruResourceActions({
  surface = "resource",
  section = "media",
  selectionCount = 1,
  imageCompatible = false,
  visualCompatible = false,
} = {}) {
  const normalizedCount = Math.max(1, Number(selectionCount || 1));

  if (section === "trash") {
    return [
      { id: "details", label: "Detalles" },
      { id: "restore", label: normalizedCount > 1 ? "Restaurar selección" : "Restaurar" },
      { id: "purge", label: normalizedCount > 1 ? "Purgar selección" : "Purgar", danger: true },
    ];
  }

  return [
    { id: "details", label: "Detalles" },
    ...(imageCompatible ? UNIVERSAL_IMAGE_ACTIONS : []),
    ...(surface === "profile" && visualCompatible ? [
      { id: "set-avatar", label: "Usar como perfil" },
      { id: "set-banner", label: "Usar como banner" },
    ] : []),
    ...(surface === "profile" ? [
      {
        id: "disassociate-profile",
        label: normalizedCount > 1 ? "Desasociar selección de esta entidad" : "Desasociar de esta entidad",
      },
    ] : []),
    {
      id: "trash",
      label: normalizedCount > 1 ? "Eliminar selección" : "Eliminar",
      danger: true,
    },
  ];
}

