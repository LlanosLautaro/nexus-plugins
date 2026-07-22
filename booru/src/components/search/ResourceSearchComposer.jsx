const React = window.React;
const { useCallback, useEffect, useMemo, useState } = React;

export default function ResourceSearchComposer({
  tokens,
  onChange,
  freeText = "",
  onFreeTextChange,
  disabled = false,
  helpers,
  invoke,
  realitySuggestions,
  missingSuggestions,
  allowedKinds = null,
}) {
  const { normalizeResourceSearchTokens, buildResourceSearchTokenKey, parseResourceSearchDraft, normalizeSearchText, normalizeResourceSearchToken, createResourceSearchTokenFromSuggestion, getResourceQueryTokenClass, buildResourceQueryTokenLabel, stepSuggestionIndex } = helpers;
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const tokensSignature = useMemo(
    () => normalizeResourceSearchTokens(tokens).map((token) => buildResourceSearchTokenKey(token)).join("|"),
    [tokens],
  );
  const draftValue = useMemo(() => {
    const matches = String(freeText || "").match(/"([^"\\]|\\.)*"|[^\s]+/g) || [];
    return matches.at(-1) || "";
  }, [freeText]);
  const parsedDraft = useMemo(
    () => parseResourceSearchDraft(draftValue),
    [draftValue],
  );

  useEffect(() => {
    let cancelled = false;
    const queryValue = String(parsedDraft?.value || "").trim();

    if (!String(parsedDraft?.raw || "").trim()) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (parsedDraft.mode === "reality") {
      const nextSuggestions = realitySuggestions.filter((item) => (
        !queryValue || normalizeSearchText(item.label).includes(normalizeSearchText(queryValue))
      ));
      setSuggestions(nextSuggestions);
      setLoading(false);
      setError("");
      return () => {
        cancelled = true;
      };
    }

    if (parsedDraft.mode === "missing") {
      const nextSuggestions = missingSuggestions.filter((item) => {
        if (!queryValue) {
          return true;
        }

        return normalizeSearchText(item.label).includes(normalizeSearchText(queryValue))
          || String(item.value || "").includes(normalizeSearchText(queryValue));
      });
      setSuggestions(nextSuggestions);
      setLoading(false);
      setError("");
      return () => {
        cancelled = true;
      };
    }

    if (!queryValue) {
      setSuggestions([]);
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    const isExplicitTag = parsedDraft.mode === "tag" && /^(?:-?tag:)/i.test(String(parsedDraft.raw || ""));
    const activeReality = normalizeResourceSearchTokens(tokens).find((token) => token?.type === "reality" && !token?.negative)?.value || null;
    const nextPromise = parsedDraft.mode === "entity" && parsedDraft.kind
      ? invoke("booru:list-entities", {
        kind: parsedDraft.kind,
        query: queryValue,
      })
      : isExplicitTag
        ? invoke("booru:list-tags", { query: queryValue })
        : invoke("booru:list-search-suggestions", { query: queryValue, reality: activeReality, allowedKinds });

    void nextPromise
      .then((data) => {
        if (cancelled) {
          return;
        }

        if (parsedDraft.mode === "entity") {
          setSuggestions(
            (Array.isArray(data?.items) ? data.items : []).map((item) => ({
              id: `entity:${parsedDraft.kind}:${item.id}`,
              type: "entity",
              kind: parsedDraft.kind,
              entityId: item.id,
              label: item.displayName,
              detail: `${item.resourceCount} recursos`,
            })),
          );
        } else if (isExplicitTag) {
          setSuggestions(
            (Array.isArray(data?.items) ? data.items : []).map((item) => ({
              id: `tag:${item.id}`,
              type: "tag",
              tagId: item.id,
              label: item.name,
              detail: `${item.resourceCount} recursos`,
            })),
          );
        } else {
          setSuggestions(Array.isArray(data?.items) ? data.items : []);
        }
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
  }, [allowedKinds, invoke, missingSuggestions, parsedDraft, realitySuggestions, tokensSignature]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions, draftValue]);

  const handleCommitToken = useCallback((nextToken) => {
    const normalizedToken = normalizeResourceSearchToken(nextToken);

    if (!normalizedToken) {
      return false;
    }

    onChange?.(normalizeResourceSearchTokens([
      ...(Array.isArray(tokens) ? tokens : []),
      normalizedToken,
    ]));
    const source = String(freeText || "");
    const fragmentIndex = source.lastIndexOf(draftValue);
    const nextFreeText = fragmentIndex >= 0
      ? `${source.slice(0, fragmentIndex)}${source.slice(fragmentIndex + draftValue.length)}`.trim().replace(/\s+/g, " ")
      : source;
    onFreeTextChange?.(nextFreeText);
    setSuggestions([]);
    setHighlightedIndex(-1);
    setError("");
    return true;
  }, [draftValue, freeText, onChange, onFreeTextChange, tokens]);

  const handleCommitRawToken = useCallback((rawToken, suggestion) => {
    const nextToken = suggestion
      ? createResourceSearchTokenFromSuggestion(rawToken, suggestion)
      : null;
    return handleCommitToken(nextToken);
  }, [handleCommitToken]);

  const handleChange = (event) => {
    onFreeTextChange?.(String(event.target.value || ""));
    setError("");
  };

  return (
    <div className="booruView__searchComposer">
      {normalizeResourceSearchTokens(tokens).length ? (
        <div className="booruView__searchCriteria">
          <span className="booruView__groupLabel">Buscando</span>
          <div className="booruView__entitySelection booruView__entitySelection--composer">
            {normalizeResourceSearchTokens(tokens).map((token) => (
            <span
              key={buildResourceSearchTokenKey(token)}
              className={["booruView__selectionChip", getResourceQueryTokenClass(token)].filter(Boolean).join(" ")}
            >
              <span>{buildResourceQueryTokenLabel(token)}</span>
              <button
                type="button"
                className="booruView__selectionChipRemove"
                onClick={() => {
                  onChange?.(
                    normalizeResourceSearchTokens(tokens).filter(
                      (item) => buildResourceSearchTokenKey(item) !== buildResourceSearchTokenKey(token),
                    ),
                  );
                }}
                aria-label={`Quitar token ${buildResourceQueryTokenLabel(token)}`}
                disabled={disabled}
              >
                x
              </button>
            </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="booruView__searchComposerShell">
        <div className="booruView__entitySelection booruView__entitySelection--composer">

          <input
            type="text"
            value={freeText}
            onChange={handleChange}
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
                onFreeTextChange?.("");
                setSuggestions([]);
                setHighlightedIndex(-1);
                return;
              }

              if (event.key === "Backspace" && !String(freeText || "").trim()) {
                const normalizedTokens = normalizeResourceSearchTokens(tokens);

                if (!normalizedTokens.length) {
                  return;
                }

                event.preventDefault();
                onChange?.(normalizedTokens.slice(0, -1));
                return;
              }

              if (event.key === "Enter" || event.key === "Tab") {
                if (!String(draftValue || "").trim()) {
                  return;
                }
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                  event.preventDefault();
                  void handleCommitRawToken(draftValue, suggestions[highlightedIndex]);
                }
              }
            }}
            placeholder="Buscar tags, personas, characters, artists o universes"
            className="booruView__searchComposerInput"
            disabled={disabled}
            aria-label="Buscar por texto libre o filtros exactos"
          />
        </div>
      </div>

      {error ? <p className="booruView__fieldError">{error}</p> : null}

      {String(draftValue || "").trim() ? (
        <div className="booruView__suggestions booruView__suggestions--stacked">
          {loading ? (
            <span className="booruView__suggestionsHint">Buscando sugerencias...</span>
          ) : suggestions.length ? (
            suggestions.map((item, index) => (
              <button
                key={`${item.id}:${tokensSignature}`}
                type="button"
                className={[
                  "booruView__suggestion",
                  highlightedIndex === index ? "is-highlighted" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => {
                  void handleCommitRawToken(draftValue, item);
                }}
              >
                <span>{item.label}</span>
                {item.detail ? <small>{item.detail}</small> : null}
              </button>
            ))
          ) : (
            <span className="booruView__suggestionsHint">
              Enter conserva el texto libre. Elige una sugerencia para filtrar por su ID exacto.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
