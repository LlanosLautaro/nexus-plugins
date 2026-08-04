import { Checkbox, Notice } from "@nexus/ui";
import { DEFAULT_SETTINGS, normalizeSettings } from "./settings.js";

export default function TabRepositorySettings({ ctx }) {
  const settings = normalizeSettings(ctx.settings.useValue?.() || DEFAULT_SETTINGS);

  const updateVisibility = async (field, checked) => {
    const next = normalizeSettings({ ...settings, [field]: checked });
    await ctx.settings.set(next);
  };

  return (
    <div className="tabRepositorySettings">
      <div className="tabRepositorySettings__row">
        <div>
          <strong>Contenido de cada fila</strong>
          <p>La búsqueda siempre consulta título y URL, aunque uno esté oculto.</p>
        </div>
        <div className="tabRepositorySettings__checks">
          <Checkbox
            checked={settings.showTitle}
            disabled={settings.showTitle && !settings.showUrl}
            label="Mostrar título"
            onChange={(event) => void updateVisibility("showTitle", event.target.checked)}
          />
          <Checkbox
            checked={settings.showUrl}
            disabled={settings.showUrl && !settings.showTitle}
            label="Mostrar URL"
            onChange={(event) => void updateVisibility("showUrl", event.target.checked)}
          />
        </div>
      </div>
      <Notice tone="info">Al menos uno de los dos campos debe permanecer visible.</Notice>
    </div>
  );
}
