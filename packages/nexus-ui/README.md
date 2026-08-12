# `@nexus/ui`

Biblioteca visual compartida por Nexus y sus plugins first-party. El host carga
los estilos globales una sola vez; cada plugin consume componentes y herramientas
SCSS sin empaquetar otra copia de React ni inyectar un theme propio.

## Imports públicos

```jsx
import {
  Button,
  CyberIconButton,
  SegmentedControl,
  TaskStatusPanel,
} from "@nexus/ui";
```

```scss
@use "@nexus/ui/scss" as *;
```

- `@nexus/ui`: componentes reutilizables aptos para plugins.
- `@nexus/ui/shell`: primitivas del chrome reservadas al host.
- `@nexus/ui/theme`: presets, normalización y variables CSS vivas.
- `@nexus/ui/scss`: tokens semánticos, mixins, funciones y motion.
- `@nexus/ui/styles`: hoja global que el host debe cargar una sola vez.

Cada componente público vive en su propia carpeta con JSX, SCSS e índice. Los
componentes de dominio continúan perteneciendo a Nexus o al plugin que los
implementa; solo se promueven aquí primitivas reutilizables y contratos visuales
estables.

## Theme runtime

Sass se compila durante el build. En producción no se ejecutan Vite ni Sass:
el Theme Editor deriva roles semánticos desde un conjunto pequeño de semillas y
los propaga mediante variables CSS. Los plugins deben consumir esas variables y
no declarar colores de acento alternativos.

Los estados cromaticos principales (acciones primarias, foco y bordes activos)
usan el `accent` exacto. Las mezclas alfa se reservan para fondos secundarios,
atmosfera y glow. Para acciones formadas solo por un icono existe una unica
primitiva publica, `CyberIconButton`; `Button` se reserva para acciones con
texto.

`TaskStatusPanel` es la superficie presentacional compartida para actividad
global: recibe trabajos normalizados, se posiciona junto a un ancla mediante
portal y expone el descarte de errores. El registro, la persistencia y la
agregacion de estados pertenecen al host.

## Validación

```powershell
npm test
```

Las pruebas verifican exports públicos, compilación de SCSS, generación del CSS
global, normalización de temas anteriores y variables derivadas.
