import { getBooruEntityVisualRenderProps } from "../../domain/entity-visual-policy.js";

export default function EntityVisualMedia({
  visual,
  alt = "",
  fallback = null,
  MediaPreview,
}) {
  const renderProps = getBooruEntityVisualRenderProps(visual);

  if (!renderProps) {
    return fallback;
  }

  return (
    <MediaPreview
      {...renderProps}
      alt={alt}
    />
  );
}
