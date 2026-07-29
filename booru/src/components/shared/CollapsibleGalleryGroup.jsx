import { Button } from "@nexus/ui";

const React = window.React;
const { useState } = React;

export default function CollapsibleGalleryGroup({ label, association = null, onAssociationHover, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section
      className={["booruView__galleryGroup", collapsed ? "is-collapsed" : ""].filter(Boolean).join(" ")}
      onPointerEnter={() => onAssociationHover?.(association)}
      onPointerLeave={() => onAssociationHover?.(null)}
    >
      <Button
        type="button"
        className="booruView__galleryGroupHeader"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((currentValue) => !currentValue)}
      >
        <span className="booruView__galleryGroupChevron" aria-hidden="true" />
        <span>{label}</span>
        <span className="booruView__galleryGroupDivider" aria-hidden="true" />
      </Button>
      {collapsed ? null : children}
    </section>
  );
}
