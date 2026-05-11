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

export function TrainingIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M7 6.5h10" />
      <path d="M7 17.5h10" />
      <path d="M6 9.5h2v5h-2z" />
      <path d="M16 9.5h2v5h-2z" />
      <path d="M9 12h6" />
      <path d="M10.5 8.5v7" />
      <path d="M13.5 8.5v7" />
    </BaseIcon>
  );
}

export function PlusIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </BaseIcon>
  );
}

export function DeleteIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M5.5 7.5h13" />
      <path d="M9 7.5V5.75A1.75 1.75 0 0 1 10.75 4h2.5A1.75 1.75 0 0 1 15 5.75V7.5" />
      <path d="M8 10.25v6.25" />
      <path d="M12 10.25v6.25" />
      <path d="M16 10.25v6.25" />
      <path d="M7 7.5l.75 10A1.5 1.5 0 0 0 9.25 19h5.5a1.5 1.5 0 0 0 1.5-1.5l.75-10" />
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

export function ArrowUpIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="m8 12 4-4 4 4" />
      <path d="M12 8v8" />
    </BaseIcon>
  );
}

export function ArrowDownIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="m8 12 4 4 4-4" />
      <path d="M12 8v8" />
    </BaseIcon>
  );
}
