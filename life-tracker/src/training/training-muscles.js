function normalizeComparableText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

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
