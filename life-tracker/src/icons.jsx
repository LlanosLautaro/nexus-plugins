function BaseIcon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function HabitosIcon() {
  return (
    <BaseIcon>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M8 10h8" />
      <path d="M8 14h5" />
      <path d="M8 7.5v5" />
    </BaseIcon>
  );
}

export function PlusIcon() {
  return (
    <BaseIcon>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </BaseIcon>
  );
}

export function CheckIcon() {
  return (
    <BaseIcon>
      <path d="m5 12 4 4 10-10" />
    </BaseIcon>
  );
}

export function CircleIcon() {
  return (
    <BaseIcon>
      <circle cx="12" cy="12" r="8" />
    </BaseIcon>
  );
}

export function PencilIcon() {
  return (
    <BaseIcon>
      <path d="M12 20h9" />
      <path d="m16.5 3.5 4 4L8 20l-4 1 1-4z" />
    </BaseIcon>
  );
}

export function TrashIcon() {
  return (
    <BaseIcon>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M8 10v8" />
      <path d="M12 10v8" />
      <path d="M16 10v8" />
    </BaseIcon>
  );
}

export function ChevronLeftIcon() {
  return (
    <BaseIcon>
      <path d="m15 18-6-6 6-6" />
    </BaseIcon>
  );
}

export function ChevronRightIcon() {
  return (
    <BaseIcon>
      <path d="m9 18 6-6-6-6" />
    </BaseIcon>
  );
}

export function RefreshIcon() {
  return (
    <BaseIcon>
      <path d="M20 5v5h-5" />
      <path d="M4 19v-5h5" />
      <path d="M18 10a7 7 0 0 0-12-3l-1 1" />
      <path d="M6 14a7 7 0 0 0 12 3l1-1" />
    </BaseIcon>
  );
}

export function SettingsIcon() {
  return (
    <BaseIcon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1 1 0 0 0 1.1.2H9a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1 1 0 0 0-.2 1.1V9c0 .4.2.8.6.9H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
    </BaseIcon>
  );
}
