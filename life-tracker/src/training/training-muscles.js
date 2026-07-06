function normalizeComparableText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const MUSCLE_NOTE_METADATA = Object.freeze({
  "pectoralis-major-clavicular": {
    movementSummary: "Ayuda a llevar el brazo al frente y hacia adentro, sobre todo en empujes con inclinacion.",
    worksWith: ["pectoralis-major-sternal", "deltoid-anterior", "serratus-anterior", "triceps-lateral-medial"],
  },
  "pectoralis-major-sternal": {
    movementSummary: "Empuja el brazo hacia delante y hacia adentro en presses, flexiones y abrazos fuertes.",
    worksWith: ["pectoralis-major-clavicular", "deltoid-anterior", "triceps-lateral-medial", "serratus-anterior"],
  },
  "pectoralis-minor": {
    movementSummary: "Ayuda a mover y estabilizar la escapula cuando empujas o llevas los hombros hacia delante.",
    worksWith: ["serratus-anterior", "pectoralis-major-sternal", "deltoid-anterior", "trapezius-middle-lower"],
  },
  "deltoid-anterior": {
    movementSummary: "Eleva el brazo al frente y ayuda en casi todo empuje por encima o delante del cuerpo.",
    worksWith: ["pectoralis-major-clavicular", "pectoralis-major-sternal", "triceps-lateral-medial", "serratus-anterior"],
  },
  "deltoid-lateral": {
    movementSummary: "Se encarga de separar el brazo del cuerpo hacia el costado.",
    worksWith: ["deltoid-anterior", "deltoid-posterior", "trapezius-middle-lower", "serratus-anterior"],
  },
  "deltoid-posterior": {
    movementSummary: "Lleva el brazo hacia atras y ayuda a abrirlo y estabilizar el hombro.",
    worksWith: ["rhomboids", "trapezius-middle-lower", "latissimus-dorsi", "teres-major"],
  },
  "latissimus-dorsi": {
    movementSummary: "Tira del brazo hacia abajo y hacia el cuerpo en dominadas, remos y gestos de trepa.",
    worksWith: ["teres-major", "rhomboids", "biceps-brachii", "trapezius-middle-lower"],
  },
  "teres-major": {
    movementSummary: "Ayuda a llevar el brazo hacia atras y pegado al torso, muy cerca del trabajo del dorsal.",
    worksWith: ["latissimus-dorsi", "rhomboids", "deltoid-posterior", "biceps-brachii"],
  },
  "rhomboids": {
    movementSummary: "Juntan las escapulas y ayudan a mantener el pecho abierto en remos y otras tracciones.",
    worksWith: ["trapezius-middle-lower", "deltoid-posterior", "latissimus-dorsi", "teres-major"],
  },
  "trapezius-middle-lower": {
    movementSummary: "Baja y acomoda las escapulas para dar una base estable a hombros y espalda.",
    worksWith: ["rhomboids", "serratus-anterior", "deltoid-posterior", "latissimus-dorsi"],
  },
  "trapezius-upper": {
    movementSummary: "Eleva la escapula y ayuda a sostener el hombro cuando cargas o elevas los brazos.",
    worksWith: ["levator-scapulae", "serratus-anterior", "trapezius-middle-lower", "deltoid-lateral"],
  },
  "levator-scapulae": {
    movementSummary: "Eleva la escapula y ayuda a inclinar o girar el cuello en movimientos cortos.",
    worksWith: ["trapezius-upper", "rhomboids", "trapezius-middle-lower", "deltoid-posterior"],
  },
  "biceps-brachii": {
    movementSummary: "Flexiona el codo y ayuda a supinar el antebrazo y a tirar del brazo hacia el cuerpo.",
    worksWith: ["brachialis", "brachioradialis", "latissimus-dorsi", "teres-major"],
  },
  brachialis: {
    movementSummary: "Flexiona el codo con casi cualquier agarre y da mucha base al tiron del brazo.",
    worksWith: ["biceps-brachii", "brachioradialis", "forearm-flexors", "latissimus-dorsi"],
  },
  "triceps-long-head": {
    movementSummary: "Extiende el codo y tambien ayuda cuando llevas el brazo hacia atras.",
    worksWith: ["triceps-lateral-medial", "deltoid-anterior", "pectoralis-major-sternal", "latissimus-dorsi"],
  },
  "triceps-lateral-medial": {
    movementSummary: "Extienden el codo en presses, flexiones y bloqueos del brazo.",
    worksWith: ["triceps-long-head", "pectoralis-major-sternal", "deltoid-anterior", "serratus-anterior"],
  },
  brachioradialis: {
    movementSummary: "Ayuda a flexionar el codo cuando el agarre es neutro o prono.",
    worksWith: ["biceps-brachii", "brachialis", "forearm-flexors", "forearm-extensors"],
  },
  "forearm-flexors": {
    movementSummary: "Cierran la mano y ayudan a sostener agarres, barras y apoyos de manos.",
    worksWith: ["brachioradialis", "forearm-extensors", "biceps-brachii"],
  },
  "forearm-extensors": {
    movementSummary: "Abren y estabilizan la muneca y los dedos cuando agarras o apoyas la mano.",
    worksWith: ["brachioradialis", "forearm-flexors", "deltoid-posterior"],
  },
  "rectus-abdominis": {
    movementSummary: "Flexiona el tronco y ayuda a acercar costillas y pelvis.",
    worksWith: ["transverse-abdominis", "obliques", "hip-flexors"],
  },
  "transverse-abdominis": {
    movementSummary: "Aprieta el abdomen como una faja y estabiliza la cintura antes de mover brazos o piernas.",
    worksWith: ["rectus-abdominis", "obliques", "erector-spinae", "serratus-anterior"],
  },
  obliques: {
    movementSummary: "Giran e inclinan el tronco y ayudan a resistir rotaciones no deseadas.",
    worksWith: ["transverse-abdominis", "rectus-abdominis", "serratus-anterior", "gluteus-medius"],
  },
  "serratus-anterior": {
    movementSummary: "Empuja y rota la escapula hacia delante y arriba para que el hombro se mueva limpio.",
    worksWith: ["trapezius-middle-lower", "trapezius-upper", "pectoralis-minor", "deltoid-anterior"],
  },
  "erector-spinae": {
    movementSummary: "Mantienen la espalda extendida y sostienen el tronco cuando te inclinas o cargas.",
    worksWith: ["transverse-abdominis", "gluteus-maximus", "hamstrings", "rhomboids"],
  },
  "gluteus-maximus": {
    movementSummary: "Extiende la cadera al ponerte de pie, saltar o empujar el cuerpo hacia delante.",
    worksWith: ["hamstrings", "erector-spinae", "quadriceps", "gluteus-medius"],
  },
  "gluteus-medius": {
    movementSummary: "Estabiliza la pelvis y separa la pierna del cuerpo, clave al apoyar una sola pierna.",
    worksWith: ["abductors", "obliques", "gluteus-maximus", "quadriceps"],
  },
  quadriceps: {
    movementSummary: "Extienden la rodilla en sentadillas, pasos, saltos y al ponerse de pie.",
    worksWith: ["vastus-medialis", "gluteus-maximus", "gastrocnemius", "hip-flexors"],
  },
  "vastus-medialis": {
    movementSummary: "Ayuda en la extension final de la rodilla y a que la rodilla siga una linea estable.",
    worksWith: ["quadriceps", "gluteus-medius", "gastrocnemius", "hamstrings"],
  },
  hamstrings: {
    movementSummary: "Llevan la cadera hacia atras y doblan la rodilla en bisagras, puentes y carrera.",
    worksWith: ["gluteus-maximus", "erector-spinae", "gastrocnemius", "quadriceps"],
  },
  gastrocnemius: {
    movementSummary: "Empuja el tobillo hacia abajo al caminar, correr, saltar y ponerte de puntas.",
    worksWith: ["soleus", "hamstrings", "quadriceps"],
  },
  soleus: {
    movementSummary: "Ayuda a empujar el suelo con el tobillo, sobre todo con rodilla flexionada y en aguantes largos.",
    worksWith: ["gastrocnemius", "quadriceps", "hamstrings"],
  },
  adductors: {
    movementSummary: "Acercan la pierna hacia el centro y ayudan a estabilizar pelvis y rodilla.",
    worksWith: ["gluteus-medius", "gluteus-maximus", "quadriceps", "hamstrings"],
  },
  abductors: {
    movementSummary: "Separan la pierna del cuerpo y ayudan a mantener estable la pelvis.",
    worksWith: ["gluteus-medius", "obliques", "quadriceps", "adductors"],
  },
  "hip-flexors": {
    movementSummary: "Llevan la rodilla o el muslo hacia el pecho y ayudan a fijar la pelvis en el core.",
    worksWith: ["rectus-abdominis", "transverse-abdominis", "quadriceps", "adductors"],
  },
});

const REGION_DEFINITIONS = [
  {
    id: "upper",
    title: "Tren superior",
    groups: [
      {
        id: "chest",
        title: "Pecho",
        muscles: [
          {
            id: "pectoralis-major-clavicular",
            title: "Pectoral superior",
            aliases: ["pectoral clavicular", "upper chest", "upper pec"],
          },
          {
            id: "pectoralis-major-sternal",
            title: "Pectoral medio",
            aliases: ["pectoral", "pecho", "middle chest", "chest"],
          },
          {
            id: "pectoralis-minor",
            title: "Pectoral menor",
            aliases: ["lower chest", "inner chest"],
          },
        ],
      },
      {
        id: "shoulders",
        title: "Hombros",
        muscles: [
          {
            id: "deltoid-anterior",
            title: "Deltoides frontal",
            aliases: ["deltoides anterior", "front delt"],
          },
          {
            id: "deltoid-lateral",
            title: "Deltoides lateral",
            aliases: ["deltoides medio", "side delt"],
          },
          {
            id: "deltoid-posterior",
            title: "Deltoides posterior",
            aliases: ["rear delt", "deltoides trasero"],
          },
        ],
      },
      {
        id: "back",
        title: "Espalda",
        muscles: [
          {
            id: "latissimus-dorsi",
            title: "Dorsal ancho",
            aliases: ["lats", "dorsales", "lat"],
          },
          {
            id: "teres-major",
            title: "Redondo mayor",
            aliases: ["teres major"],
          },
          {
            id: "rhomboids",
            title: "Romboides",
            aliases: ["rhomboid", "romboide"],
          },
          {
            id: "trapezius-middle-lower",
            title: "Trapecio medio e inferior",
            aliases: ["lower traps", "mid traps", "trapecio bajo"],
          },
        ],
      },
      {
        id: "traps-neck",
        title: "Trapecios",
        muscles: [
          {
            id: "trapezius-upper",
            title: "Trapecio superior",
            aliases: ["upper traps", "trapecio alto"],
          },
          {
            id: "levator-scapulae",
            title: "Elevador de la escapula",
            aliases: ["neck support", "levator scapulae"],
          },
        ],
      },
      {
        id: "biceps",
        title: "Biceps",
        muscles: [
          {
            id: "biceps-brachii",
            title: "Biceps braquial",
            aliases: ["biceps", "bicep"],
          },
          {
            id: "brachialis",
            title: "Braquial",
            aliases: ["brachialis"],
          },
        ],
      },
      {
        id: "triceps",
        title: "Triceps",
        muscles: [
          {
            id: "triceps-long-head",
            title: "Triceps cabeza larga",
            aliases: ["triceps long head"],
          },
          {
            id: "triceps-lateral-medial",
            title: "Triceps lateral y medial",
            aliases: ["triceps", "triceps lateral", "triceps medial"],
          },
        ],
      },
      {
        id: "forearms",
        title: "Antebrazos",
        muscles: [
          {
            id: "brachioradialis",
            title: "Braquiorradial",
            aliases: ["brachioradialis"],
          },
          {
            id: "forearm-flexors",
            title: "Flexores del antebrazo",
            aliases: ["forearm flexors", "flexores"],
          },
          {
            id: "forearm-extensors",
            title: "Extensores del antebrazo",
            aliases: ["forearm extensors", "extensores"],
          },
        ],
      },
    ],
  },
  {
    id: "core",
    title: "Core",
    groups: [
      {
        id: "abs",
        title: "Abdomen",
        muscles: [
          {
            id: "rectus-abdominis",
            title: "Recto abdominal",
            aliases: ["abs", "abdominales", "six pack"],
          },
          {
            id: "transverse-abdominis",
            title: "Transverso abdominal",
            aliases: ["core profundo", "transverse abs"],
          },
        ],
      },
      {
        id: "obliques",
        title: "Oblicuos",
        muscles: [
          {
            id: "obliques",
            title: "Oblicuos",
            aliases: ["oblique", "serrato lateral"],
          },
          {
            id: "serratus-anterior",
            title: "Serrato anterior",
            aliases: ["serratus", "boxer muscle"],
          },
        ],
      },
      {
        id: "lumbar",
        title: "Zona lumbar",
        muscles: [
          {
            id: "erector-spinae",
            title: "Erectores espinales",
            aliases: ["lumbar", "espalda baja", "lower back"],
          },
        ],
      },
    ],
  },
  {
    id: "lower",
    title: "Tren inferior",
    groups: [
      {
        id: "glutes",
        title: "Gluteos",
        muscles: [
          {
            id: "gluteus-maximus",
            title: "Gluteo mayor",
            aliases: ["glute max", "gluteo"],
          },
          {
            id: "gluteus-medius",
            title: "Gluteo medio",
            aliases: ["glute med", "abductor gluteo"],
          },
        ],
      },
      {
        id: "quads",
        title: "Cuadriceps",
        muscles: [
          {
            id: "quadriceps",
            title: "Cuadriceps",
            aliases: ["quads", "quad"],
          },
          {
            id: "vastus-medialis",
            title: "Vasto medial",
            aliases: ["teardrop quad", "vmo"],
          },
        ],
      },
      {
        id: "hamstrings",
        title: "Isquiotibiales",
        muscles: [
          {
            id: "hamstrings",
            title: "Isquiotibiales",
            aliases: ["hamstrings", "hams", "femorales"],
          },
        ],
      },
      {
        id: "calves",
        title: "Pantorrillas",
        muscles: [
          {
            id: "gastrocnemius",
            title: "Gemelos",
            aliases: ["gastrocnemius", "calves", "pantorrilla"],
          },
          {
            id: "soleus",
            title: "Soleo",
            aliases: ["soleus"],
          },
        ],
      },
      {
        id: "hips",
        title: "Cadera",
        muscles: [
          {
            id: "adductors",
            title: "Aductores",
            aliases: ["adductor", "inner thigh"],
          },
          {
            id: "abductors",
            title: "Abductores",
            aliases: ["abductor", "outer thigh"],
          },
          {
            id: "hip-flexors",
            title: "Flexores de cadera",
            aliases: ["hip flexor", "psoas"],
          },
        ],
      },
    ],
  },
];

export const TRAINING_MUSCLE_REGIONS = REGION_DEFINITIONS.map((region) => ({
  id: region.id,
  title: region.title,
}));

export const TRAINING_MUSCLE_GROUPS = REGION_DEFINITIONS.flatMap((region) =>
  region.groups.map((group) => ({
    id: group.id,
    title: group.title,
    regionId: region.id,
    regionTitle: region.title,
  })),
);

export const TRAINING_MUSCLE_CATALOG = REGION_DEFINITIONS.flatMap((region) =>
  region.groups.flatMap((group) =>
    group.muscles.map((muscle) => {
      const noteMetadata = MUSCLE_NOTE_METADATA[muscle.id] || null;
      const aliases = Array.isArray(muscle.aliases)
        ? [...new Set([muscle.title, ...muscle.aliases].map((entry) => String(entry).trim()).filter(Boolean))]
        : [muscle.title];

      return {
        id: muscle.id,
        title: muscle.title,
        slug: muscle.id,
        aliases,
        regionId: region.id,
        regionTitle: region.title,
        groupId: group.id,
        groupTitle: group.title,
        movementSummary: noteMetadata?.movementSummary || "",
        relatedMuscleIds: Array.isArray(noteMetadata?.worksWith) ? [...noteMetadata.worksWith] : [],
        searchText: normalizeComparableText([muscle.id, muscle.title, region.title, group.title, ...aliases].join(" ")),
      };
    }),
  ),
);

const MUSCLE_BY_ID = new Map(TRAINING_MUSCLE_CATALOG.map((muscle) => [muscle.id, muscle]));
const MUSCLE_BY_ALIAS = new Map();

for (const muscle of TRAINING_MUSCLE_CATALOG) {
  for (const alias of muscle.aliases) {
    MUSCLE_BY_ALIAS.set(normalizeComparableText(alias), muscle);
  }
}

export function getTrainingMuscleLookup() {
  return MUSCLE_BY_ID;
}

export function getTrainingMuscleById(muscleId) {
  return MUSCLE_BY_ID.get(String(muscleId || "").trim()) || null;
}

export function findTrainingMuscleByAlias(value) {
  const normalized = normalizeComparableText(value);
  return normalized ? MUSCLE_BY_ALIAS.get(normalized) || null : null;
}

export function listTrainingMuscles({
  query = "",
  regionId = "",
  groupId = "",
} = {}) {
  const normalizedQuery = normalizeComparableText(query);
  const normalizedRegionId = String(regionId || "").trim();
  const normalizedGroupId = String(groupId || "").trim();

  return TRAINING_MUSCLE_CATALOG.filter((muscle) => {
    if (normalizedRegionId && muscle.regionId !== normalizedRegionId) {
      return false;
    }

    if (normalizedGroupId && muscle.groupId !== normalizedGroupId) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return muscle.searchText.includes(normalizedQuery);
  });
}
