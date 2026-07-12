const React = window.React;
const { useEffect, useState } = React;

export default function ResourcePagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  Button,
  clampPage,
  getPageWindow,
}) {
  const totalPages = Math.max(1, Math.ceil(Number(totalCount || 0) / Math.max(1, Number(pageSize || 1))));
  const [pageInputValue, setPageInputValue] = useState(String(currentPage || 1));

  useEffect(() => {
    setPageInputValue(String(currentPage || 1));
  }, [currentPage]);

  if (totalPages <= 1) {
    return null;
  }

  const safeCurrentPage = clampPage(currentPage, totalPages);
  const pageWindow = getPageWindow(safeCurrentPage, totalPages);
  const commitPageInput = () => {
    onPageChange?.(clampPage(pageInputValue, totalPages));
  };

  return (
    <div className="booruView__pagination">
      <div className="booruView__paginationButtons">
        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={() => onPageChange?.(1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Ir a la primera pagina"
        >
          {"<<"}
        </Button>
        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={() => onPageChange?.(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          aria-label="Ir a la pagina anterior"
        >
          {"<"}
        </Button>

        {pageWindow.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            tone={pageNumber === safeCurrentPage ? "primary" : "secondary"}
            className="booruView__paginationButton"
            onClick={() => onPageChange?.(pageNumber)}
            aria-label={`Ir a la pagina ${pageNumber}`}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={() => onPageChange?.(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          aria-label="Ir a la pagina siguiente"
        >
          {">"}
        </Button>
        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={() => onPageChange?.(totalPages)}
          disabled={safeCurrentPage >= totalPages}
          aria-label="Ir a la ultima pagina"
        >
          {">>"}
        </Button>
      </div>

      <div className="booruView__paginationJump">
        <input
          type="number"
          min={1}
          max={totalPages}
          value={pageInputValue}
          onChange={(event) => setPageInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitPageInput();
            }
          }}
          aria-label="Numero de pagina"
        />
        <Button
          type="button"
          className="booruView__paginationButton"
          onClick={commitPageInput}
        >
          Ir
        </Button>
      </div>
    </div>
  );
}

