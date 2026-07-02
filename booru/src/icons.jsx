function BaseIcon({ children, size = 18, strokeWidth = 1.8 }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function BooruIcon(props) {
  return (
    <BaseIcon {...props}>
      <rect x="4.5" y="5" width="15" height="14" rx="2" />
      <path d="m8 14 2.7-2.7a1.3 1.3 0 0 1 1.8 0L16 14.8" />
      <path d="m13 11.5 1.2-1.2a1.3 1.3 0 0 1 1.8 0l2 2" />
      <circle cx="9" cy="9.2" r="1.1" />
    </BaseIcon>
  );
}

export function RefreshIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18 11a7 7 0 0 0-12-3" />
      <path d="M6 13a7 7 0 0 0 12 3" />
    </BaseIcon>
  );
}

export function FolderIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M4.75 7.25h4l1.8 1.9h8.7A1.75 1.75 0 0 1 21 10.9v6.35A1.75 1.75 0 0 1 19.25 19H4.75A1.75 1.75 0 0 1 3 17.25V9A1.75 1.75 0 0 1 4.75 7.25Z" />
    </BaseIcon>
  );
}

export function DuplicateIcon(props) {
  return (
    <BaseIcon {...props}>
      <rect x="8" y="8" width="10" height="10" rx="1.8" />
      <path d="M6.5 15H6A2 2 0 0 1 4 13V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v.5" />
    </BaseIcon>
  );
}

export function PulseIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M3.5 12h3.1l1.8-3.4 3.1 7 2.6-5h6.4" />
    </BaseIcon>
  );
}

export function AlertIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.7 19 18H5l7-13.3Z" />
      <path d="M12 9.4v3.9" />
      <circle cx="12" cy="15.9" r=".75" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}
