import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MOCK_PASSWORD = process.env.MOCK_PASSWORD || "Password123";
const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const CITIES = [
  { name: "Paris", lat: 48.8566, lng: 2.3522, postcode: "75001" },
  { name: "Lyon", lat: 45.764, lng: 4.8357, postcode: "69001" },
  { name: "Marseille", lat: 43.2965, lng: 5.3698, postcode: "13001" },
  { name: "Toulouse", lat: 43.6047, lng: 1.4442, postcode: "31000" },
  { name: "Nice", lat: 43.7102, lng: 7.262, postcode: "06000" },
  { name: "Nantes", lat: 47.2184, lng: -1.5536, postcode: "44000" },
  { name: "Strasbourg", lat: 48.5734, lng: 7.7521, postcode: "67000" },
  { name: "Montpellier", lat: 43.6108, lng: 3.8767, postcode: "34000" },
  { name: "Bordeaux", lat: 44.8378, lng: -0.5792, postcode: "33000" },
  { name: "Lille", lat: 50.6292, lng: 3.0573, postcode: "59000" },
  { name: "Rennes", lat: 48.1173, lng: -1.6778, postcode: "35000" },
  { name: "Reims", lat: 49.2583, lng: 4.0317, postcode: "51100" },
  { name: "Metz", lat: 49.1193, lng: 6.1757, postcode: "57000" },
  { name: "Dijon", lat: 47.322, lng: 5.0415, postcode: "21000" },
  { name: "Angers", lat: 47.4784, lng: -0.5632, postcode: "49000" },
  { name: "Grenoble", lat: 45.1885, lng: 5.7245, postcode: "38000" },
  { name: "Caen", lat: 49.1829, lng: -0.3707, postcode: "14000" },
  { name: "Nîmes", lat: 43.8367, lng: 4.3601, postcode: "30000" },
];

const STREET_NAMES = [
  "Rue Victor Hugo",
  "Avenue de la République",
  "Rue Jean Jaurès",
  "Boulevard du Commerce",
  "Rue Saint-Michel",
  "Avenue des Champs",
  "Rue de la Liberté",
  "Boulevard Voltaire",
  "Rue des Lilas",
  "Rue de la Gare",
  "Allée des Champs",
  "Rue des Fleurs",
];

const GYM_CONCEPTS = [
  { prefix: "FitPro", suffix: "Center" },
  { prefix: "PowerGym", suffix: "Arena" },
  { prefix: "BodyBuilding", suffix: "Club" },
  { prefix: "Fitness", suffix: "Studio" },
  { prefix: "CrossFit", suffix: "Box" },
  { prefix: "Muscle", suffix: "Factory" },
  { prefix: "Iron", suffix: "Temple" },
  { prefix: "Urban", suffix: "Gym" },
  { prefix: "Pulse", suffix: "Hub" },
  { prefix: "Elevate", suffix: "Loft" },
  { prefix: "Nordic", suffix: "Lodge" },
  { prefix: "Solstice", suffix: "Training" },
];

const ACTIVITY_COLLECTIONS = [
  "Musculation, Cardio, CrossFit, Cours collectifs, Coaching",
  "Yoga, Pilates, Stretching, Méditation, Fitness doux",
  "Boxing, Kickboxing, MMA, Fitness combattant",
  "Natation, Aquagym, Aquabike, Sauna, Hammam",
  "Musculation libre, Powerlifting, Strongman, Haltérophilie",
  "HIIT, Bootcamp, Circuit training, TRX, Kettlebell",
  "Danse fitness, Zumba, Step, Aérobic, Cardio dance",
  "Cyclisme indoor, Spinning, RPM, Biking, Cardio vélo",
  "Coaching personnalisé, Nutrition, Mobilité, Réathlétisation",
  "Entraînement outdoor, Parcours urbains, TechFit",
];

const EXERCISE_TYPES = [
  {
    name: "Pompes",
    description: "Exercice de base pour le haut du corps",
    targetedMuscles: "Pectoraux,Triceps,Épaules",
  },
  {
    name: "Tractions",
    description: "Exercice pour le dos et les bras",
    targetedMuscles: "Dorsaux,Biceps,Avant-bras",
  },
  {
    name: "Squats",
    description: "Exercice fondamental pour les jambes",
    targetedMuscles: "Quadriceps,Fessiers,Ischio-jambiers",
  },
  {
    name: "Développé couché",
    description: "Exercice majeur pour les pectoraux",
    targetedMuscles: "Pectoraux,Triceps,Épaules antérieures",
  },
  {
    name: "Soulevé de terre",
    description: "Exercice polyarticulaire complet",
    targetedMuscles: "Dorsaux,Fessiers,Ischio-jambiers,Trapèzes",
  },
  {
    name: "Rowing barre",
    description: "Exercice pour l'épaisseur du dos",
    targetedMuscles: "Dorsaux,Trapèzes,Biceps",
  },
  {
    name: "Dips",
    description: "Exercice au poids du corps pour les triceps",
    targetedMuscles: "Triceps,Pectoraux inférieurs,Épaules",
  },
  {
    name: "Curl biceps",
    description: "Isolation des biceps",
    targetedMuscles: "Biceps,Avant-bras",
  },
  {
    name: "Développé militaire",
    description: "Exercice pour les épaules",
    targetedMuscles: "Épaules,Triceps,Trapèzes supérieurs",
  },
  {
    name: "Abdominaux crunch",
    description: "Exercice classique pour les abdominaux",
    targetedMuscles: "Grand droit,Obliques",
  },
  {
    name: "Fentes",
    description: "Exercice d'équilibre pour les jambes",
    targetedMuscles: "Quadriceps,Fessiers,Ischio-jambiers",
  },
  {
    name: "Planche",
    description: "Gainage statique pour le core",
    targetedMuscles: "Abdominaux,Lombaires,Fessiers",
  },
  {
    name: "Burpees",
    description: "Enchaînement cardio plein corps",
    targetedMuscles: "Pectoraux,Quadriceps,Abdominaux",
  },
  {
    name: "Kettlebell Swing",
    description: "Puissance explosive pour les hanches",
    targetedMuscles: "Fessiers,Ischio-jambiers,Épaules",
  },
  {
    name: "Hip Thrust",
    description: "Isolation des fessiers",
    targetedMuscles: "Fessiers,Ischio-jambiers",
  },
  {
    name: "Mountain Climbers",
    description: "Cardio et gainage dynamique",
    targetedMuscles: "Abdominaux,Épaules,Quadriceps",
  },
  {
    name: "Battle Rope",
    description: "Travail cardio et coordination",
    targetedMuscles: "Épaules,Biceps,Triceps",
  },
  {
    name: "Farmer's Walk",
    description: "Endurance de la chaîne postérieure",
    targetedMuscles: "Avant-bras,Épaules,Fessiers",
  },
  {
    name: "Pike Push-ups",
    description: "Renforcement des deltoïdes",
    targetedMuscles: "Épaules,Triceps,Core",
  },
  {
    name: "Pull-over",
    description: "Étirement et expansion thoracique",
    targetedMuscles: "Pectoraux,Dorsaux",
  },
];

const CHALLENGE_TEMPLATES = [
  {
    title: "Défi Pompes 30 jours",
    description: "Passez de 10 à 100 pompes en 30 jours avec une progression quotidienne",
    goals: "Atteindre 100 pompes d'affilée",
    difficulty: "MEDIUM",
    duration: 30,
    exercises: ["Pompes", "Planche"],
  },
  {
    title: "Challenge Squat Débutant",
    description: "Programme de 21 jours pour maîtriser le squat parfait",
    goals: "200 squats par jour pendant 21 jours",
    difficulty: "EASY",
    duration: 21,
    exercises: ["Squats", "Fentes"],
  },
  {
    title: "Iron Body - Programme Avancé",
    description: "6 semaines d'entraînement intensif full body",
    goals: "Développer force et masse musculaire",
    difficulty: "HARD",
    duration: 42,
    exercises: ["Développé couché", "Soulevé de terre", "Squats", "Rowing barre"],
  },
  {
    title: "Cardio Burn Challenge",
    description: "Programme cardio haute intensité sur 4 semaines",
    goals: "Brûler 10 000 calories en 28 jours",
    difficulty: "MEDIUM",
    duration: 28,
    exercises: ["Squats", "Pompes", "Planche"],
  },
  {
    title: "Pull-Up Master",
    description: "De zéro à héros des tractions en 8 semaines",
    goals: "Réaliser 20 tractions consécutives",
    difficulty: "HARD",
    duration: 56,
    exercises: ["Tractions", "Rowing barre"],
  },
  {
    title: "Core Strength 15 jours",
    description: "Renforcez votre sangle abdominale en 2 semaines",
    goals: "Tenir une planche de 5 minutes",
    difficulty: "EASY",
    duration: 15,
    exercises: ["Planche", "Abdominaux crunch"],
  },
  {
    title: "Upper Body Blast",
    description: "Programme intensif haut du corps sur 5 semaines",
    goals: "Augmenter sa force de 20%",
    difficulty: "MEDIUM",
    duration: 35,
    exercises: ["Développé couché", "Pompes", "Dips", "Curl biceps"],
  },
  {
    title: "Leg Day Warrior",
    description: "Transformez vos jambes en 6 semaines",
    goals: "Squatter 1.5x son poids de corps",
    difficulty: "HARD",
    duration: 42,
    exercises: ["Squats", "Soulevé de terre", "Fentes"],
  },
  {
    title: "HIIT Express",
    description: "20 minutes d'interval training pour booster le métabolisme",
    goals: "Brûler 350 calories en 20 minutes",
    difficulty: "MEDIUM",
    duration: 14,
    exercises: ["Burpees", "Mountain Climbers", "Planche"],
  },
  {
    title: "Force Athlète",
    description: "Programme mixte haltérophilie + conditioning",
    goals: "Soulever 120% du poids corporel",
    difficulty: "HARD",
    duration: 56,
    exercises: ["Soulevé de terre", "Kettlebell Swing", "Farmer's Walk"],
  },
  {
    title: "Metabolisme Reset",
    description: "21 jours d'entraînements courts et explosifs",
    goals: "Augmenter son VO2 max",
    difficulty: "MEDIUM",
    duration: 21,
    exercises: ["Burpees", "Pike Push-ups", "Planche"],
  },
  {
    title: "Mobility Flow",
    description: "Pilates et mouvements de mobilité pour débloquer la posture",
    goals: "Atténuer les tensions du dos",
    difficulty: "EASY",
    duration: 21,
    exercises: ["Planche", "Abdominaux crunch", "Pull-over"],
  },
  {
    title: "Power Up",
    description: "Cycle de 4 semaines pour concrétiser ses gains de force",
    goals: "Augmenter la charge maximale de 10%",
    difficulty: "HARD",
    duration: 28,
    exercises: ["Développé militaire", "Rowing barre", "Développé couché"],
  },
  {
    title: "Week-end Warrior",
    description: "Séances boostées pour garder la cadence le weekend",
    goals: "Enchainer 3 séances de 60 minutes",
    difficulty: "MEDIUM",
    duration: 7,
    exercises: ["Squats", "Burpees", "Dips"],
  },
];

const BADGES = [
  {
    name: "Première Séance",
    icon: "💪🏻",
    rule: { name: "Enregistrer 1 séance", field: "totalSessions", operator: ">=", value: 1 },
  },
  {
    name: "Débutant Motivé",
    icon: "🌟",
    rule: { name: "Enregistrer 5 séances", field: "totalSessions", operator: ">=", value: 5 },
  },
  {
    name: "Premier Pas",
    icon: "👣",
    rule: { name: "Brûler 100 calories", field: "totalCalories", operator: ">=", value: 100 },
  },
  {
    name: "Premier Défi",
    icon: "🎯",
    rule: { name: "Compléter 1 défi", field: "completedChallenges", operator: ">=", value: 1 },
  },
  {
    name: "Habitué",
    icon: "💪",
    rule: { name: "Enregistrer 30 séances", field: "totalSessions", operator: ">=", value: 30 },
  },
  {
    name: "Brûleur de Calories",
    icon: "🔥",
    rule: { name: "Brûler 10 000 calories", field: "totalCalories", operator: ">=", value: 10000 },
  },
  {
    name: "Régulier",
    icon: "📅",
    rule: { name: "Enregistrer 10 séances", field: "totalSessions", operator: ">=", value: 10 },
  },
  {
    name: "Endurant",
    icon: "⏱️",
    rule: {
      name: "Accumuler 500 minutes d'entraînement",
      field: "totalDuration",
      operator: ">=",
      value: 500,
    },
  },
  {
    name: "Persévérant",
    icon: "💎",
    rule: { name: "Compléter 5 défis", field: "completedChallenges", operator: ">=", value: 5 },
  },
  {
    name: "Marathonien",
    icon: "🏃",
    rule: { name: "Compléter 10 défis", field: "completedChallenges", operator: ">=", value: 10 },
  },
  {
    name: "Guerrier",
    icon: "⚔️",
    rule: { name: "Enregistrer 50 séances", field: "totalSessions", operator: ">=", value: 50 },
  },
  {
    name: "Champion d'Endurance",
    icon: "🏆",
    rule: {
      name: "Accumuler 1000 minutes d'entraînement",
      field: "totalDuration",
      operator: ">=",
      value: 1000,
    },
  },
  {
    name: "Incinérateur",
    icon: "🌋",
    rule: { name: "Brûler 25 000 calories", field: "totalCalories", operator: ">=", value: 25000 },
  },
  {
    name: "Expert en Fitness",
    icon: "👑",
    rule: { name: "Compléter 50 défis", field: "completedChallenges", operator: ">=", value: 50 },
  },
  {
    name: "Légende",
    icon: "🦸",
    rule: { name: "Enregistrer 100 séances", field: "totalSessions", operator: ">=", value: 100 },
  },
  {
    name: "Ultra Endurant",
    icon: "⚡",
    rule: {
      name: "Accumuler 2500 minutes d'entraînement",
      field: "totalDuration",
      operator: ">=",
      value: 2500,
    },
  },
  {
    name: "Machine à Calories",
    icon: "🔋",
    rule: { name: "Brûler 50 000 calories", field: "totalCalories", operator: ">=", value: 50000 },
  },
  {
    name: "Maître des Défis",
    icon: "🎖️",
    rule: { name: "Compléter 25 défis", field: "completedChallenges", operator: ">=", value: 25 },
  },
  {
    name: "Champion Ultime",
    icon: "🥇",
    rule: { name: "Enregistrer 200 séances", field: "totalSessions", operator: ">=", value: 200 },
  },
  {
    name: "Dieu du Fitness",
    icon: "⭐",
    rule: { name: "Compléter 100 défis", field: "completedChallenges", operator: ">=", value: 100 },
  },
  {
    name: "Titan",
    icon: "💫",
    rule: {
      name: "Accumuler 5000 minutes d'entraînement",
      field: "totalDuration",
      operator: ">=",
      value: 5000,
    },
  },
  {
    name: "Supernovae",
    icon: "🌟",
    rule: {
      name: "Brûler 100 000 calories",
      field: "totalCalories",
      operator: ">=",
      value: 100000,
    },
  },
  {
    name: "Ambassadeur",
    icon: "🎤",
    rule: { name: "Inviter 5 amis", field: "referrals", operator: ">=", value: 5 },
  },
];

const OWNER_FIRST_NAMES = [
  "Aurélie",
  "Bastien",
  "Camille",
  "David",
  "Elodie",
  "Florian",
  "Gaëlle",
  "Hugo",
  "Isabelle",
  "Julien",
  "Karim",
  "Léna",
  "Marius",
  "Nora",
  "Oscar",
  "Pauline",
];

const OWNER_LAST_NAMES = [
  "Leclerc",
  "Martinez",
  "Durand",
  "Moreau",
  "Leroy",
  "Rousseau",
  "Perez",
  "Marchand",
  "Morel",
  "Laurent",
  "Garnier",
  "Chevalier",
  "Arnaud",
  "Barbier",
  "Dupuis",
  "Lemoine",
];

const CLIENT_FIRST_NAMES = [
  "Sophie",
  "Lucas",
  "Emma",
  "Alexandre",
  "Léa",
  "Thomas",
  "Chloé",
  "Hugo",
  "Camille",
  "Maxime",
  "Julie",
  "Antoine",
  "Marie",
  "Nicolas",
  "Sarah",
  "Victor",
  "Amélie",
  "Louis",
  "Maëlle",
  "Paul",
  "Laura",
  "Mathis",
  "Mila",
  "Noah",
  "Clara",
  "Enzo",
  "Zoé",
  "Gabriel",
  "Lina",
  "Romain",
  "Inès",
];

const CLIENT_LAST_NAMES = [
  "Bernard",
  "Petit",
  "Robert",
  "Richard",
  "Durand",
  "Moreau",
  "Simon",
  "Laurent",
  "Lefebvre",
  "Mercier",
  "Dupont",
  "Lambert",
  "Fontaine",
  "Rouge",
  "Rousseau",
];

const PHONE_FORMAT_SEGMENTS = [
  () => Math.floor(Math.random() * 900 + 100),
  () => Math.floor(Math.random() * 90 + 10),
  () => Math.floor(Math.random() * 90 + 10),
  () => Math.floor(Math.random() * 90 + 10),
];

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const shuffle = <T>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

const createGymSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\p{L}0-9\s-]/gu, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const generateRandomAddress = (cityData: (typeof CITIES)[number]) => {
  const latOffset = (Math.random() - 0.5) * 0.025;
  const lngOffset = (Math.random() - 0.5) * 0.025;
  return {
    address: `${randomBetween(1, 220)} ${pick(STREET_NAMES)}`,
    city: cityData.name,
    postcode: cityData.postcode,
    latitude: cityData.lat + latOffset,
    longitude: cityData.lng + lngOffset,
  };
};

const generateGymDescription = (gymName: string, activities: string, city: string) =>
  `${gymName} à ${city} propose ${activities.split(",")[0]} et un accompagnement personnalisé dans un cadre premium.`;

const generateGymPhone = () =>
  `0${PHONE_FORMAT_SEGMENTS.map((segment) => segment().toString()).join(" ")}`;

const clearDatabase = async () => {
  console.log("🗑️  Clearing all tables (reset seed)...");
  await prisma.workoutLog.deleteMany();
  await prisma.challengeSession.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.rewardRule.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.exerciseType.deleteMany();
  await prisma.gym.deleteMany();
  await prisma.gymOwnerRequest.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Database cleared\n");
};

async function createAuthUser(
  email: string,
  name: string,
  password: string,
  role: "CLIENT" | "GYM_OWNER" | "SUPER_ADMIN" = "CLIENT",
) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const profile = await prisma.userProfile.upsert({
        where: { authUserId: existingUser.id },
        create: {
          authUserId: existingUser.id,
          email,
          displayName: name,
          role,
        },
        update: {
          email,
          displayName: name,
          role,
        },
      });
      return { user: existingUser, profile };
    }

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= 6; attempt++) {
      const registerRes = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (registerRes.ok) break;

      const errorText = await registerRes.text().catch(() => "");
      const isRateLimited =
        registerRes.status === 429 || errorText.toLowerCase().includes("too many requests");

      if (!isRateLimited || attempt === 6) {
        throw new Error(`Failed to register ${email}: ${errorText}`);
      }

      const backoffMs = 1000 * Math.pow(2, attempt - 1);
      console.log(`   ⏳ Rate limited creating ${email}. Retrying in ${backoffMs}ms...`);
      await sleep(backoffMs);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error(`User ${email} not found after creation`);

    const profile = await prisma.userProfile.upsert({
      where: { authUserId: user.id },
      create: {
        authUserId: user.id,
        email,
        displayName: name,
        role,
      },
      update: {
        email,
        displayName: name,
        role,
      },
    });

    if (role === "SUPER_ADMIN") {
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: { role: "SUPER_ADMIN" },
      });
    }

    return { user, profile };
  } catch (error) {
    console.error(`Error creating ${email}:`, error);
    throw error;
  }
}

async function main() {
  console.log("🌱 Starting full data rebuild...\n");

  await clearDatabase();

  console.log("👑 Creating Super Admin(s)...");
  const { user: adminUser } = await createAuthUser(
    "admin@legym.fr",
    "Admin LeGym",
    MOCK_PASSWORD,
    "SUPER_ADMIN",
  );
  console.log(`   ✅ Super Admin: ${adminUser.email}`);

  for (const email of SUPER_ADMIN_EMAILS) {
    if (email === "admin@legym.fr") continue;
    try {
      const { user } = await createAuthUser(
        email,
        `Admin ${email.split("@")[0]}`,
        MOCK_PASSWORD,
        "SUPER_ADMIN",
      );
      console.log(`   ✅ Super Admin: ${user.email}`);
    } catch (error) {
      console.log(
        `   ⚠️  Failed to create ${email}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
  console.log("");

  console.log("💪 Creating exercise types...");
  const exerciseTypes: {
    id: number;
    name: string;
    description: string | null;
    targetedMuscles: string | null;
  }[] = [];
  for (const exercise of EXERCISE_TYPES) {
    const created = await prisma.exerciseType.upsert({
      where: { name: exercise.name },
      create: exercise,
      update: {
        description: exercise.description,
        targetedMuscles: exercise.targetedMuscles,
      },
    });
    console.log(`   ✅ ${created.name}`);
    exerciseTypes.push(created);
  }
  console.log("");

  console.log("🏢 Creating gym owners and gyms...");
  const gymOwners: Awaited<ReturnType<typeof createAuthUser>>["profile"][] = [];
  const gyms: Awaited<ReturnType<typeof prisma.gym.create>>[] = [];

  for (let i = 0; i < OWNER_FIRST_NAMES.length; i++) {
    const ownerEmail = `owner${i + 1}@legym.fr`;
    const ownerName = `${OWNER_FIRST_NAMES[i]} ${OWNER_LAST_NAMES[i % OWNER_LAST_NAMES.length]}`;

    const { profile } = await createAuthUser(ownerEmail, ownerName, MOCK_PASSWORD, "GYM_OWNER");
    gymOwners.push(profile);

    const gymsForOwner = Math.random() > 0.4 ? 2 : 1;
    for (let gymIndex = 0; gymIndex < gymsForOwner; gymIndex++) {
      const concept = pick(GYM_CONCEPTS);
      const cityData = pick(CITIES);
      const gymName = `${concept.prefix} ${cityData.name} ${concept.suffix}`;
      const slug = `${createGymSlug(gymName)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const addressData = generateRandomAddress(cityData);
      const activities = pick(ACTIVITY_COLLECTIONS);

      const gym = await prisma.gym.create({
        data: {
          name: gymName,
          slug,
          city: addressData.city,
          address: addressData.address,
          postcode: addressData.postcode,
          latitude: addressData.latitude,
          longitude: addressData.longitude,
          contactEmail: ownerEmail,
          contactPhone: generateGymPhone(),
          description: generateGymDescription(gymName, activities, addressData.city),
          equipmentSummary:
            "Machines cardio, poids libres, machines guidées, espace crossfit, cours collectifs",
          activities,
          status: Math.random() > 0.25 ? "APPROVED" : Math.random() > 0.5 ? "PENDING" : "APPROVED",
          ownerId: profile.id,
        },
      });
      gyms.push(gym);

      console.log(`   ✅ ${gym.name} (${gym.status}) - ${addressData.postcode}`);
    }
  }
  console.log("");

  console.log("👥 Creating client accounts...");
  const clients: Awaited<ReturnType<typeof createAuthUser>>["profile"][] = [];
  const totalClients = CLIENT_FIRST_NAMES.length;

  for (let i = 0; i < totalClients; i++) {
    const firstName = CLIENT_FIRST_NAMES[i];
    const lastName = pick(CLIENT_LAST_NAMES);
    const clientEmail = `client${i + 1}@legym.fr`;
    const clientName = `${firstName} ${lastName}`;

    const { profile } = await createAuthUser(clientEmail, clientName, MOCK_PASSWORD, "CLIENT");
    clients.push(profile);
    console.log(`   ✅ ${clientName} - ${clientEmail}`);
  }
  console.log("");

  console.log("🎯 Creating challenges...");
  const approvedGyms = gyms.filter((gym) => gym.status === "APPROVED");
  const challenges: Awaited<ReturnType<typeof prisma.challenge.create>>[] = [];

  for (let i = 0; i < 14; i++) {
    const template = pick(CHALLENGE_TEMPLATES);
    const gym = pick(approvedGyms);
    const owner = gymOwners.find((ownerProfile) => ownerProfile.id === gym.ownerId);
    if (!owner) continue;

    const title = `${template.title} - ${gym.name}`;
    const exerciseNames = template.exercises.join(",");

    const existingChallenge = await prisma.challenge.findFirst({
      where: { title, gymId: gym.id },
    });

    let challenge;
    if (existingChallenge) {
      challenge = await prisma.challenge.update({
        where: { id: existingChallenge.id },
        data: {
          description: template.description,
          goals: template.goals,
          difficulty: template.difficulty,
          duration: template.duration,
          recommendedExercises: exerciseNames,
          relatedEquipment: "Poids libres, Bancs, Barres",
        },
      });
    } else {
      challenge = await prisma.challenge.create({
        data: {
          title,
          description: template.description,
          goals: template.goals,
          difficulty: template.difficulty,
          duration: template.duration,
          recommendedExercises: exerciseNames,
          relatedEquipment: "Poids libres, Bancs, Barres",
          gymId: gym.id,
          creatorId: owner.id,
        },
      });
    }
    challenges.push(challenge);
    console.log(`   ✅ ${challenge.title}`);
  }

  for (let i = 0; i < 10; i++) {
    const template = pick(CHALLENGE_TEMPLATES);
    const creator = pick(clients);

    const title = `${template.title} (Commune)`;
    const exerciseNames = template.exercises.join(",");

    const existingChallenge = await prisma.challenge.findFirst({
      where: { title, creatorId: creator.id },
    });

    const challenge =
      existingChallenge ??
      (await prisma.challenge.create({
        data: {
          title,
          description: template.description,
          goals: template.goals,
          difficulty: template.difficulty,
          duration: template.duration,
          recommendedExercises: exerciseNames,
          creatorId: creator.id,
        },
      }));
    challenges.push(challenge);
    console.log(`   ✅ ${challenge.title} (Community)`);
  }
  console.log("");

  console.log("📊 Creating challenge sessions and workout logs...");
  let sessionCount = 0;
  let logCount = 0;

  for (const client of clients) {
    const selectedChallenges = shuffle(challenges).slice(0, randomBetween(2, 5));
    for (const challenge of selectedChallenges) {
      const statusRoll = Math.random();
      const sessionStatus =
        statusRoll < 0.3 ? "NOT_STARTED" : statusRoll < 0.8 ? "IN_PROGRESS" : "COMPLETED";
      const session = await prisma.challengeSession.upsert({
        where: { challengeId_userId: { challengeId: challenge.id, userId: client.id } },
        create: {
          challengeId: challenge.id,
          userId: client.id,
          status: sessionStatus,
        },
        update: {},
      });
      sessionCount++;

      if (session.status === "IN_PROGRESS") {
        const logsToCreate = randomBetween(3, 8);
        for (let logIndex = 0; logIndex < logsToCreate; logIndex++) {
          const daysAgo = randomBetween(1, 28);
          await prisma.workoutLog.create({
            data: {
              challengeSessionId: session.id,
              date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
              duration: randomBetween(30, 90),
              calories: randomBetween(250, 550),
              notes: pick([
                "Excellente séance !",
                "Un peu fatigué mais satisfait",
                "Record personnel battu 💪",
                "Séance difficile mais productive",
                "Super motivation aujourd'hui",
                "Séance coachée en duo",
                "Connexion avec la musique du jour",
              ]),
            },
          });
          logCount++;
        }
      }
    }
  }
  console.log(`   ✅ ${sessionCount} challenge sessions created`);
  console.log(`   ✅ ${logCount} workout logs created\n`);

  console.log("🏆 Creating badges and reward rules...");
  for (const badgeData of BADGES) {
    const { rule, ...badgeInfo } = badgeData;
    const badge = await prisma.badge.upsert({
      where: { name: badgeInfo.name },
      create: badgeInfo,
      update: { icon: badgeInfo.icon },
    });

    const { name: ruleName, ...ruleCriteria } = rule;
    await prisma.rewardRule.upsert({
      where: { badgeId: badge.id },
      create: {
        badgeId: badge.id,
        name: ruleName,
        criteria: JSON.stringify(ruleCriteria),
      },
      update: {
        name: ruleName,
        criteria: JSON.stringify(ruleCriteria),
      },
    });

    console.log(`   ✅ ${badge.icon} ${badge.name}`);
  }
  console.log("");

  console.log("🎖️  Awarding starter badges to clients...");
  const firstBadge = await prisma.badge.findFirst({ where: { name: "Première Séance" } });
  if (firstBadge) {
    for (const client of clients.slice(0, 12)) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: client.id, badgeId: firstBadge.id } },
        create: {
          userId: client.id,
          badgeId: firstBadge.id,
          reason: "Première séance enregistrée avec succès !",
        },
        update: {},
      });
    }
    console.log(`   ✅ Awarded "Première Séance" to 12 clients`);
  }
  console.log("");

  console.log("✨ Seeding completed successfully!\n");
  console.log("📝 Summary:");
  console.log(`   - Super Admin: ${adminUser.email}`);
  console.log(
    `   - ${gymOwners.length} Gym Owners (owner1@legym.fr - owner${gymOwners.length}@legym.fr)`,
  );
  console.log(`   - ${gyms.length} Gyms`);
  console.log(
    `   - ${clients.length} Clients (client1@legym.fr - client${clients.length}@legym.fr)`,
  );
  console.log(`   - ${exerciseTypes.length} Exercise Types`);
  console.log(`   - ${challenges.length} Challenges`);
  console.log(`   - ${sessionCount} Challenge Sessions`);
  console.log(`   - ${logCount} Workout Logs`);
  console.log(`   - ${BADGES.length} Badges`);
  console.log(`\n🔑 All passwords: ${MOCK_PASSWORD}`);
  console.log(`\n🎉 Tous les comptes sont prêts à être utilisés!`);
}

main()
  .catch((error) => {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
