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

export function ChatIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M6.75 7.25h10.5A1.75 1.75 0 0 1 19 9v6a1.75 1.75 0 0 1-1.75 1.75H12l-3.75 3v-3H6.75A1.75 1.75 0 0 1 5 15V9a1.75 1.75 0 0 1 1.75-1.75Z" />
      <path d="M8.75 11.25h6.5" />
      <path d="M8.75 13.75h4.5" />
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

export function ClearIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M5.5 7.5h13" />
      <path d="M9.25 7.5V5.75A1.75 1.75 0 0 1 11 4h2a1.75 1.75 0 0 1 1.75 1.75V7.5" />
      <path d="M8 10.5v5.25" />
      <path d="M12 10.5v5.25" />
      <path d="M16 10.5v5.25" />
      <path d="M7 7.5l.8 10.1A1.5 1.5 0 0 0 9.3 19h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7.5" />
    </BaseIcon>
  );
}

export function SendIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="m4.75 12 14-6.25-3.5 12.5-4.25-4.25L4.75 12Z" />
      <path d="M10.75 13.75 18.75 5.75" />
    </BaseIcon>
  );
}
