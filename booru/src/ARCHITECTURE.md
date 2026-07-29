# Arquitectura del renderer de Booru

`renderer.js` registra la vista; `BooruWorkspaceView.jsx` conserva la
coordinacion de estado, routing de secciones e IPC. Las piezas de UI viven en
`components/`, por dominio, y los estilos de cada dominio en `styles/`.
Las reglas puras compartidas por backend y renderer viven en `domain/`.

## Componentes compartidos

- `EntityVisualCropper`: encuadre por Pointer Events para avatar 1:1 y banner
  3:1. Guarda `scale`, `offsetX` y `offsetY` normalizados en el perfil.
- `EntityVisualMedia`: adaptador único de proyección para card y encabezado de
  perfil. Aplica la fuente, transformación y fallback definidos por dominio.
- `ClipboardAssociationComposer`: alta/asociacion de un recurso pegado con
  busqueda tipada de Persona, Artist, Character y Universe.
- `components/media/`: preview, cards, grilla virtual, paginacion interna,
  hero overlay y drag preview.
- `components/search/`: composer estructurado y autocompletes de entidad/tag.
- `components/recommendations/`: panel incremental, badge y destino DnD.
- `components/entities/`: cards, perfil, datos y galeria de entidad.
- `EntityNavigationBar` sustituye la sidebar en las cuatro secciones de entidad;
  `EntityRelationsGrid` reutiliza `EntityGrid` sin envolverlo en otro panel.
- `CharacterCreationDialog`: alta compacta de Character que exige buscar o
  crear un Universe antes de invocar el unico IPC valido de creacion.
- `components/resources/`: inspector de clasificacion y metadata.
- `components/settings/` y `components/shared/`: ajustes y menu contextual.

## Reglas de datos e interaccion

- Todas las galerias usan `offset/limit` e incrementan lotes al acercarse al
  final; ningun flujo presenta controles de pagina.
- `booru:paste-clipboard-media` es el contrato canonico. Acepta un temporal
  creado por el bridge y una asociacion existente o una entidad a asegurar.
  El IPC historico de pegado a entidad sigue disponible como adaptador.
- Las visuales de perfil priorizan el original para conservar animacion y
  definicion. Video se reproduce silencioso y en loop; GIF/WebP usan su asset
  original para no degradarse a una thumbnail estatica.
- Una card bajo el cursor es el destino inmediato de `Ctrl/Cmd+V`; fuera de
  una card se abre el compositor. Character siempre requiere Universe.
- `domain/classification-policy.js` es la fuente unica para realidad efectiva,
  procedencia `auto/manual`, completitud esencial y prioridades de tipos. El
  backend conserva las invariantes; Details solo proyecta la misma politica.
- `domain/pending-workflow.js` comparte entre backend y renderer el contrato de
  filtros visibles, `missing:type`, faltantes contextuales, alcance del
  recomendador y pertenencia inmediata a `Esencial` o `Tags`. En el alcance
  Esencial, `Real` convierte la Persona faltante en contexto implicito y evita
  duplicar ese hecho como un filtro visible. Media proyecta solo recursos con
  la ruta esencial completa y no admite filtros de faltantes.
- `domain/resource-mutations.js` normaliza resultados granulares, parchea la
  ventana incremental y resuelve el recurso anclado de Details por ID. La
  galeria puede retirar o mover una card sin cambiar el `activeId`; el IPC por
  IDs mantiene el inspector actualizado fuera de la consulta visible.
- `domain/duplicate-ingest.js` serializa por hash la sección crítica de ingesta.
  Un hash conocido actualiza y devuelve únicamente el canónico, consume el
  entrante y fusiona la clasificación rápida antes de recalcular la política.
- `domain/video-preview-policy.js` decide original o short con un límite único
  de 15 segundos. La variante persistida invalida derivados legacy y el worker
  recibe la duración desde el backend en vez de mantener otro umbral oculto.
- `domain/details-policy.js` proyecta la matriz de prioridad sobre los campos
  cotidianos, decide si realidad es editable o de solo lectura y detecta
  relaciones mixtas sin convertir su interseccion en un reemplazo implicito.
- `domain/entity-visual-policy.js` normaliza encuadres y construye el DTO visual
  efectivo. La card y `profile.visuals.avatar` reciben el mismo objeto; banner
  usa el mismo contrato con una selección y layout independientes.
- `domain/entity-relations.js` declara cruces permitidos, pestañas y paginacion.
  El backend deriva relaciones desde recursos activos y devuelve DTO de entidad
  normalizados; no persiste nuevas relaciones manuales.
- La galeria de perfil usa el alcance interno `profile`, no `media`. Contador y
  galeria comparten recursos activos y respetan exclusiones locales; completar
  la ruta esencial solo decide pertenencia a Media/Pendientes.
- Las invalidaciones externas reconcilian solo la ventana ya cargada. Cada
  respuesta lleva el contexto de seccion, consulta, pagina y cantidad con el
  que se inicio y se descarta si otro cambio la vuelve obsoleta.

## Limites de modulo

Los componentes no acceden a SQLite ni al filesystem. El renderer solo llama
IPC; schema, catalogo, entidades, recomendaciones e ingesta continúan siendo
responsabilidad del backend. Las dependencias de host y helpers se inyectan
desde el controlador para conservar esta frontera y hacer cada componente
reutilizable. Al extraer otra pieza desde la view, mantener esa misma frontera
y consumir primitivas públicas de `@nexus/ui`.

Cada identificador usado por un componente debe ser local, importado o recibido
por props. Un componente no puede referenciar helpers, constantes ni telemetria
de `BooruWorkspaceView` por nombre. Los wrappers del controlador son el unico
lugar que conecta `window.nexus`, React DnD, logger y helpers de dominio con
una pieza visual.

## Validacion de regresion

`nexus-backend/tests/booru-phase2.test.mjs` valida el catalogo aislado, el
contrato de mutaciones, el ancla de Details y las carreras de reconciliacion. Para
comprobar el renderer real se puede generar una biblioteca persistente en `zzz
test vault` con `node nexus-backend/tests/seed-booru-runtime-fixtures.mjs`. El
set contiene mas de una pagina de imagenes, GIF, WebP, video y un duplicado;
se ingiere mediante la carpeta vigilada configurada en los settings del plugin.
Despues de una modificacion, construir, sincronizar ese vault y verificar en
DevTools que recomendaciones, perfil, pegado y galerias no emitan errores.
