export function RepositoryIcon({ className = "" }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 5.5h14v4H5zM5 10.5h14v4H5zM5 15.5h14v3H5z" />
      <path d="M8 7.5h8M8 12.5h8M8 17h5" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" />
      <path d="M4.5 12h15M12 4c2.1 2.2 3.2 4.9 3.2 8S14.1 17.8 12 20M12 4C9.9 6.2 8.8 8.9 8.8 12S9.9 17.8 12 20" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

export function DragIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="8" cy="7" r="1.25" /><circle cx="16" cy="7" r="1.25" />
      <circle cx="8" cy="12" r="1.25" /><circle cx="16" cy="12" r="1.25" />
      <circle cx="8" cy="17" r="1.25" /><circle cx="16" cy="17" r="1.25" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 7h14M9 7V5h6v2M7 7l1 12h8l1-12M10 10v6M14 10v6" />
    </svg>
  );
}

export function FolderIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M4 6.5h6l2 2h8v9H4z" />
    </svg>
  );
}
