const ASSOCIATION_KINDS = new Set(["author", "artist", "character", "universe", "tag"]);

export function normalizeBooruClipboardAssociation(value) {
  const kind = String(value?.kind || "").trim();
  const entityId = String(value?.entityId || value?.id || "").trim();
  const entityName = String(value?.entityName || value?.name || "").trim();

  if (!ASSOCIATION_KINDS.has(kind) || (!entityId && !entityName)) return null;

  return {
    kind,
    entityId,
    entityName,
    universeId: String(value?.universeId || "").trim(),
    universeName: String(value?.universeName || "").trim(),
  };
}

export function mergeBooruClipboardAssociations(...sources) {
  const associations = [];
  const seen = new Set();

  sources.flat(Infinity).forEach((candidate) => {
    const association = normalizeBooruClipboardAssociation(candidate);
    if (!association) return;
    const identity = association.entityId
      ? `${association.kind}:id:${association.entityId}`
      : `${association.kind}:name:${association.entityName.normalize("NFKC").toLocaleLowerCase("es-AR")}`;
    if (seen.has(identity)) return;
    seen.add(identity);
    associations.push(association);
  });

  return associations;
}

export function getBooruPlacementAssociation(placement) {
  return normalizeBooruClipboardAssociation(placement?.association);
}

