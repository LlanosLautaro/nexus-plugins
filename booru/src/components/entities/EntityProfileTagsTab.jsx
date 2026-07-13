import { Field } from "../../../../../nexus-frontend/src/ui/index.js";

const React = window.React;
const { useEffect, useState } = React;

async function invoke(channel, payload) {
  const response = await window.nexus.ipc.invoke(channel, payload);
  if (!response?.ok) throw new Error(response?.error || "No se pudo guardar las tags.");
  return response.data;
}

export default function EntityProfileTagsTab({
  kind,
  profile,
  busy = false,
  onProfileChange,
  TagField,
}) {
  const [tags, setTags] = useState(() => Array.isArray(profile?.tags) ? profile.tags : []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTags(Array.isArray(profile?.tags) ? profile.tags : []);
  }, [profile?.id, profile?.tags]);

  const save = async (nextTags) => {
    setTags(nextTags);
    setSaving(true);
    try {
      const result = await invoke("booru:save-entity-profile", {
        kind,
        entityId: profile?.id,
        tagIds: nextTags.map((tag) => tag.id),
        aliasNames: profile?.aliases || [],
        socialLinks: (profile?.socialLinks || []).map((link) => ({
          platformId: link?.platform?.id,
          url: link?.url,
        })),
      });
      onProfileChange?.(result?.profile || null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="booruView__entityProfileData">
      <Field
        label="Tags"
        description="Se heredan automaticamente a los recursos asociados a esta entidad."
        className="booruView__field"
      >
        <TagField
          label="Tags de entidad"
          selectedItems={tags}
          onChange={(nextTags) => void save(nextTags)}
          disabled={busy || saving}
        />
      </Field>
      {saving ? <span className="booruView__suggestionsHint">Sincronizando tags heredadas...</span> : null}
    </div>
  );
}
