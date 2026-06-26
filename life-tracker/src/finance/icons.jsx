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

export function WalletIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M4.75 8.25a2 2 0 0 1 2-2h10.5a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2Z" />
      <path d="M16.5 12h2.75v2.5H16.5a1.25 1.25 0 0 1 0-2.5Z" />
      <path d="M7.5 6.25V5.5a1.75 1.75 0 0 1 1.75-1.75H17" />
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

export function PencilIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="m4 20 4.5-1 9-9a2.1 2.1 0 0 0-3-3l-9 9L4 20Z" />
      <path d="m13 7 4 4" />
    </BaseIcon>
  );
}

export function TrashIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 7.5h15" />
      <path d="M9.5 7.5V5.75A1.75 1.75 0 0 1 11.25 4h1.5a1.75 1.75 0 0 1 1.75 1.75V7.5" />
      <path d="M7 7.5 8 19a1.5 1.5 0 0 0 1.49 1.37h5.02A1.5 1.5 0 0 0 16 19l1-11.5" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </BaseIcon>
  );
}

export function ArrowInIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M12 18V6" />
      <path d="m7.5 10.5 4.5-4.5 4.5 4.5" />
      <path d="M5 19.25h14" />
    </BaseIcon>
  );
}

export function ArrowOutIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M12 6v12" />
      <path d="m16.5 13.5-4.5 4.5-4.5-4.5" />
      <path d="M5 4.75h14" />
    </BaseIcon>
  );
}
