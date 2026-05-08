const React = window.React;

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

export function BookIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M6.5 4.5h10a2 2 0 0 1 2 2v12.5H8.75a2.25 2.25 0 0 0-2.25 2.25V6.75a2.25 2.25 0 0 1 2.25-2.25Z" />
      <path d="M6.5 18.5a2.5 2.5 0 0 1 2.5-2.5h9.5" />
      <path d="M10 8.5h5.5" />
      <path d="M10 11.5h4.5" />
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

export function ExternalIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M14 5h5v5" />
      <path d="m10 14 9-9" />
      <path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    </BaseIcon>
  );
}

export function ZoomInIcon(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
      <path d="m16 16 4 4" />
    </BaseIcon>
  );
}

export function ZoomOutIcon(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M8 11h6" />
      <path d="m16 16 4 4" />
    </BaseIcon>
  );
}
