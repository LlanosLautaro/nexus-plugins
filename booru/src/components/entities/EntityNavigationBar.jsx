import { Button, InlineField, Input, SearchField } from "@nexus/ui";

export default function EntityNavigationBar({
  kind,
  contextLabel,
  profileOpen,
  searchValue,
  createValue,
  busy = false,
  searchable = true,
  searchContent = null,
  browseControls = null,
  onBack,
  onOpenInMedia,
  onSearchChange,
  onCreateChange,
  onCreate,
  entityKindLabels,
}) {
  const kindLabel = entityKindLabels[kind] || kind || "Entidad";

  return (
    <nav className="booruView__entityNavbar" aria-label="Navegacion de entidades">
      <div className="booruView__entityNavbarContext">
        {profileOpen ? (
          <Button type="button" onClick={() => onBack?.()}>
            Volver
          </Button>
        ) : null}
        <div className="booruView__entityNavbarTitle">
          <span>{kindLabel}</span>
          {profileOpen && contextLabel ? <strong>{contextLabel}</strong> : null}
        </div>
        {profileOpen ? (
          <Button type="button" onClick={() => onOpenInMedia?.()}>
            Abrir en Media
          </Button>
        ) : null}
      </div>

      {searchable ? (
        searchContent || (
          <InlineField label="Buscar" grow className="booruView__entityNavbarSearch">
            <SearchField
              value={searchValue}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder={profileOpen ? "Buscar en esta seccion" : `Buscar ${kindLabel.toLowerCase()}`}
              aria-label={`Buscar ${kindLabel.toLowerCase()}`}
            />
          </InlineField>
        )
      ) : null}

      {browseControls}

      <div className="booruView__entityNavbarCreate">
        <InlineField label="Crear" grow>
          <Input
            value={createValue}
            onChange={(event) => onCreateChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onCreate?.();
              }
            }}
            placeholder={`Crear ${kindLabel.toLowerCase()}`}
            aria-label={`Crear ${kindLabel.toLowerCase()}`}
          />
        </InlineField>
        <Button
          type="button"
          onClick={() => onCreate?.()}
          disabled={!String(createValue || "").trim() || busy}
        >
          Crear
        </Button>
      </div>
    </nav>
  );
}
