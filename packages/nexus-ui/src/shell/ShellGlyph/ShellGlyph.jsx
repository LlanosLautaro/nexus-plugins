const GLYPHS = {
  files: (
    <>
      <path d="M3 6.5h6.8l2 2H21v10.5H3z" />
      <path d="M3 6.5V4.5h7l2 2h7" />
    </>
  ),
  graph: (
    <>
      <circle cx="5" cy="7" r="2.2" />
      <circle cx="18.5" cy="5" r="2.2" />
      <circle cx="17" cy="18" r="2.2" />
      <circle cx="7" cy="17" r="2.2" />
      <path d="m7 7 9.3-1.5M6 9l1 5.8m2-1 6.2-6.7m.6 8.9-6.6.7" />
    </>
  ),
  books: (
    <>
      <path d="M5 4.5h5.5v15H5zM13.5 4.5H19v15h-5.5z" />
      <path d="M7 7h1.5m7 0H17M7 17h1.5m7 0H17" />
    </>
  ),
  life: (
    <>
      <path d="M3 12h4l2.2-5 4 10 2.1-5H21" />
      <path d="M5 4.5h14v15H5z" />
    </>
  ),
  booru: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2" />
      <circle cx="9" cy="9" r="1.7" />
      <path d="m5.5 17 4.3-4.5 3.1 3 2.5-2.4 3.2 3.9" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14M9 4h6l1 3H8zM7 7l1 13h8l1-13" />
      <path d="M10 10v7m4-7v7" />
    </>
  ),
  plugin: (
    <>
      <path d="M8 4v4m8-4v4M6 8h12v5a6 6 0 0 1-12 0z" />
      <path d="M12 19v3" />
    </>
  ),
  tree: (
    <>
      <path d="M7 4v5m0 0h10m-10 0v7m10-7v7" />
      <rect x="4" y="2" width="6" height="4" rx="1" />
      <rect x="4" y="16" width="6" height="4" rx="1" />
      <rect x="14" y="16" width="6" height="4" rx="1" />
    </>
  ),
  folders: (
    <>
      <path d="M3 7.5h7l2 2h9v9.5H3z" />
      <path d="M3 7.5V5h7l2 2h7" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  filter: (
    <>
      <path d="M3 5h18l-7 8v5.5l-4 1.5v-7z" />
    </>
  ),
  vault: (
    <>
      <path d="M4 7h16v13H4zM6 7l1.5-3h9L18 7" />
      <path d="M8 11h8M8 15h5" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h7m4 0h5M4 12h3m4 0h9M4 18h9m4 0h3" />
      <circle cx="13" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="18" r="2" />
    </>
  ),
};

export function ShellGlyph({ className = "", name, size = 17 }) {
  return (
    <svg
      aria-hidden="true"
      className={`nexus-ui-shell-glyph ${className}`.trim()}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {GLYPHS[name] || GLYPHS.plugin}
    </svg>
  );
}
