import { Button } from "../../../../../nexus-frontend/src/ui/index.js";

const React = window.React;
const { useEffect, useMemo, useState } = React;

export default function SingleEntityAutocompleteField({
  kind,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "",
  buttonLabel = "Asignar",
  invoke,
  helpers,
  entityKindLabels,
}) {
  const { findExactEntityMatch, stepSuggestionIndex } = helpers;
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    const trimmedQuery = String(query || "").trim();

    if (!trimmedQuery) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    void invoke("booru:list-entities", { kind, query: trimmedQuery })
      .then((data) => {
        if (cancelled) {
          return;
        }

        const currentValueId = String(value?.id || "").trim();
        setSuggestions(
          (Array.isArray(data?.items) ? data.items : []).filter((item) => item.id !== currentValueId),
        );
        setError("");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        setSuggestions([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar sugerencias.",
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [kind, query, value]);

  useEffect(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1);
  }, [query, suggestions]);

  const handleSelectEntity = (entity) => {
    onChange?.(entity);
    setQuery("");
    setSuggestions([]);
    setError("");
    setHighlightedIndex(-1);
  };

  const handleEnsureEntity = async () => {
    const trimmedQuery = String(query || "").trim();

    if (!trimmedQuery || disabled) {
      return;
    }

    const exactSuggestion = findExactEntityMatch(suggestions, trimmedQuery);

    if (exactSuggestion) {
      handleSelectEntity(exactSuggestion);
      return;
    }

    setLoading(true);

    try {
      const result = await invoke("booru:ensure-entity", { kind, name: trimmedQuery });
      handleSelectEntity(result.entity);
    } catch (ensureError) {
      setError(
        ensureError instanceof Error
          ? ensureError.message
          : "No se pudo asegurar la entidad.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booruView__entityInlineEditor">
      {value ? (
        <div className="booruView__entitySelection">
          <span className="booruView__selectionChip">
            <span>{value.displayName}</span>
            <button
              type="button"
              className="booruView__selectionChipRemove"
              onClick={() => onChange?.(null)}
              disabled={disabled}
              aria-label={`Quitar ${value.displayName}`}
            >
              x
            </button>
          </span>
        </div>
      ) : null}

      <div className="booruView__entityInputRow">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, suggestions.length, 1));
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlightedIndex((currentValue) => stepSuggestionIndex(currentValue, suggestions.length, -1));
              return;
            }

            if (event.key === "Escape") {
              setQuery("");
              setSuggestions([]);
              setHighlightedIndex(-1);
              return;
            }

            if (event.key === "Enter" || event.key === "Tab") {
              event.preventDefault();

              if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                handleSelectEntity(suggestions[highlightedIndex]);
                return;
              }

              void handleEnsureEntity();
            }
          }}
          placeholder={placeholder || `Buscar ${label.toLowerCase()} o crear uno nuevo`}
          disabled={disabled}
          aria-label={label}
        />
        <Button
          type="button"
          onClick={() => void handleEnsureEntity()}
          disabled={!String(query || "").trim() || disabled}
        >
          {buttonLabel}
        </Button>
      </div>

      {error ? <p className="booruView__fieldError">{error}</p> : null}

      {String(query || "").trim() ? (
        <div className="booruView__suggestions">
          {loading ? (
            <span className="booruView__suggestionsHint">Buscando sugerencias...</span>
          ) : suggestions.length ? (
              suggestions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    "booruView__suggestion",
                    highlightedIndex === index ? "is-highlighted" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleSelectEntity(item)}
                >
                <span>{item.displayName}</span>
                <small>{item.resourceCount} recursos</small>
              </button>
            ))
          ) : (
            <span className="booruView__suggestionsHint">
              Sin coincidencias. Enter crea {entityKindLabels[kind]?.toLowerCase() || "la entidad"}.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
