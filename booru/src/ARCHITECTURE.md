# Arquitectura del renderer de Booru

`renderer.js` registra la vista; `BooruWorkspaceView.jsx` conserva la
coordinacion de estado, routing de secciones e IPC. Las piezas de UI viven en
`components/`, por dominio, y los estilos de cada dominio en `styles/`.

## Componentes compartidos

- `EntityVisualCropper`: encuadre por Pointer Events para avatar 1:1 y banner
  3:1. Guarda `scale`, `offsetX` y `offsetY` normalizados en el perfil.
- `ClipboardAssociationComposer`: alta/asociacion de un recurso pegado con
  busqueda tipada de Persona, Artist, Character y Universe.
- `components/media/`: preview, cards, grilla virtual, paginacion interna,
  hero overlay y drag preview.
- `components/search/`: composer estructurado y autocompletes de entidad/tag.
- `components/recommendations/`: panel incremental, badge y destino DnD.
- `components/entities/`: cards, perfil, datos y galeria de entidad.
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

## Limites de modulo

Los componentes no acceden a SQLite ni al filesystem. El renderer solo llama
IPC; schema, catalogo, entidades, recomendaciones e ingesta continúan siendo
responsabilidad del backend. Las dependencias de host y helpers se inyectan
desde el controlador para conservar esta frontera y hacer cada componente
reutilizable. Al extraer otra pieza desde la view, mantener esa misma frontera
y consumir primitivas de `nexus-frontend/src/ui`.

Cada identificador usado por un componente debe ser local, importado o recibido
por props. Un componente no puede referenciar helpers, constantes ni telemetria
de `BooruWorkspaceView` por nombre. Los wrappers del controlador son el unico
lugar que conecta `window.nexus`, React DnD, logger y helpers de dominio con
una pieza visual.

## Validacion de regresion

`nexus-backend/tests/booru-phase2.test.mjs` valida el catalogo aislado. Para
comprobar el renderer real se puede generar una biblioteca persistente en `zzz
test vault` con `node nexus-backend/tests/seed-booru-runtime-fixtures.mjs`. El
set contiene mas de una pagina de imagenes, GIF, WebP, video y un duplicado;
se ingiere mediante la carpeta vigilada configurada en los settings del plugin.
Despues de una modificacion, construir, sincronizar ese vault y verificar en
DevTools que recomendaciones, perfil, pegado y galerias no emitan errores.
