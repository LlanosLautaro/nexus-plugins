import { Button, Input, SearchField } from "@nexus/ui";

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
      {profileOpen ? (
        <div className="booruView__entityNavbarContext">
          <Button type="button" onClick={() => onBack?.()}>
            Volver
          </Button>
          {contextLabel ? <strong className="booruView__entityNavbarTitle">{contextLabel}</strong> : null}
          <Button type="button" onClick={() => onOpenInMedia?.()}>
            Media
          </Button>
        </div>
      ) : null}

      {searchable ? (
        searchContent || (
          <SearchField
            className="booruView__entityNavbarSearch"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={profileOpen ? "Buscar en esta seccion" : `Buscar ${kindLabel.toLowerCase()}`}
            aria-label={`Buscar ${kindLabel.toLowerCase()}`}
          />
        )
      ) : null}

      {browseControls}

      <div className="booruView__entityNavbarCreate">
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
