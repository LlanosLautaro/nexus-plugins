const React = window.React;
const { useCallback, useEffect, useMemo, useState } = React;

export default function ResourceSearchComposer({
  tokens,
  onChange,
  disabled = false,
  helpers,
  invoke,
  realitySuggestions,
  missingSuggestions,
}) {
  const { normalizeResourceSearchTokens, buildResourceSearchTokenKey, parseResourceSearchDraft, normalizeSearchText, normalizeResourceSearchToken, createResourceSearchTokenFromSuggestion, createResourceSearchTokenFromFragment, tokenizeBooruQuery, getResourceQueryTokenClass, buildResourceQueryTokenLabel, stepSuggestionIndex } = helpers;
  const [draftValue, setDraftValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const tokensSignature = useMemo(
    () => normalizeResourceSearchTokens(tokens).map((token) => buildResourceSearchTokenKey(token)).join("|"),
    [tokens],
  );
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

    const nextPromise = parsedDraft.mode === "entity" && parsedDraft.kind
      ? invoke("booru:list-entities", {
        kind: parsedDraft.kind,
        query: queryValue,
      })
      : invoke("booru:list-tags", { query: queryValue });

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
        } else {
          setSuggestions(
            (Array.isArray(data?.items) ? data.items : []).map((item) => ({
              id: `tag:${item.id}`,
              type: "tag",
              tagId: item.id,
              label: item.name,
              detail: `${item.resourceCount} recursos`,
            })),
          );
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
  }, [parsedDraft]);

  useEffect(() => {
    setHighlightedIndex(suggestions.length ? 0 : -1);
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
    setDraftValue("");
    setSuggestions([]);
    setHighlightedIndex(-1);
    setError("");
    return true;
  }, [onChange, tokens]);

  const handleCommitRawToken = useCallback((rawToken, suggestion = null) => {
    const nextToken = suggestion
      ? createResourceSearchTokenFromSuggestion(rawToken, suggestion)
      : createResourceSearchTokenFromFragment(rawToken);
    return handleCommitToken(nextToken);
  }, [handleCommitToken]);

  const handleChange = (event) => {
    const nextValue = String(event.target.value || "");
    const endsWithWhitespace = /\s$/.test(nextValue);
    const rawTokens = tokenizeBooruQuery(nextValue);
    const completeTokens = endsWithWhitespace ? rawTokens : rawTokens.slice(0, -1);
    const trailingToken = endsWithWhitespace ? "" : (rawTokens.at(-1) || "");

    if (completeTokens.length) {
      let nextTokens = Array.isArray(tokens) ? tokens : [];

      for (const rawToken of completeTokens) {
        const nextToken = createResourceSearchTokenFromFragment(rawToken);

        if (!nextToken) {
          continue;
        }

        nextTokens = normalizeResourceSearchTokens([
          ...nextTokens,
          nextToken,
        ]);
      }

      onChange?.(nextTokens);
      setError("");
    }

    setDraftValue(trailingToken);
  };

  return (
    <div className="booruView__searchComposer">
      <div className="booruView__searchComposerShell">
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

          <input
            type="text"
            value={draftValue}
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
                setDraftValue("");
                setSuggestions([]);
                setHighlightedIndex(-1);
                return;
              }

              if (event.key === "Backspace" && !String(draftValue || "").trim()) {
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

                event.preventDefault();
                const selectedSuggestion = highlightedIndex >= 0 && suggestions[highlightedIndex]
                  ? suggestions[highlightedIndex]
                  : suggestions[0];
                void handleCommitRawToken(draftValue, selectedSuggestion || null);
              }
            }}
            placeholder="Tag, persona:, char:, artist:, universe:, reality:, missing:"
            className="booruView__searchComposerInput"
            disabled={disabled}
            aria-label="Buscar por tags y filtros estructurados"
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
              Tab o Enter agrega el filtro exacto sin crear tags nuevas.
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

