export type Movie = {
  id: string;
  title: string;
  year: number;
  rating: number;
  ageRating: string;
  seasons?: number;
  duration?: string;
  genres: string[];
  type: "Movie" | "Series" | "Original";
  description: string;
  poster: string;
  backdrop: string;
  cast: { name: string; role: string; avatar: string }[];
};

const portrait = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=600&q=80`;

const land = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1600&q=80`;

const face = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=200&q=80`;

export const featured: Movie = {
  id: "neon-paradox",
  title: "The Neon Paradox",
  year: 2024,
  rating: 8.4,
  ageRating: "18+",
  seasons: 1,
  type: "Original",
  genres: ["Sci-Fi", "Thriller", "Mystery"],
  description:
    "In a sprawling cyberpunk metropolis, a rogue AI detective must unravel a conspiracy that blurs the line between human consciousness and synthetic reality, racing against time to prevent a city-wide blackout.",
  poster: portrait("photo-1635805737707-575885ab0820"),
  backdrop: land("photo-1542204165-65bf26472b9b"),
  cast: [
    { name: "Elena Rostova", role: "Lead Detective", avatar: face("photo-1494790108377-be9c29b29330") },
    { name: "Marcus Vance", role: "Rogue AI", avatar: face("photo-1500648767791-00dcc994a43e") },
    { name: "Sarah Chen", role: "Cyber Analyst", avatar: face("photo-1438761681033-6461ffad8d80") },
    { name: "David Kim", role: "Director", avatar: face("photo-1507003211169-0a1dd7228f2d") },
  ],
};

export const movies: Movie[] = [
  {
    id: "echoes-of-tomorrow",
    title: "Echoes of Tomorrow",
    year: 2025,
    rating: 8.1,
    ageRating: "16+",
    duration: "2h 14m",
    type: "Movie",
    genres: ["Sci-Fi", "Drama"],
    description:
      "A quantum physicist begins receiving messages from her future self, forcing her to confront a choice that will define humanity.",
    poster: portrait("photo-1574267432553-4b4628081c31"),
    backdrop: land("photo-1517604931442-7e0c8ed2963c"),
    cast: [],
  },
  {
    id: "midnight-bloom",
    title: "Midnight Bloom",
    year: 2024,
    rating: 7.8,
    ageRating: "15+",
    duration: "1h 48m",
    type: "Movie",
    genres: ["Romance", "Drama"],
    description:
      "Two strangers cross paths in Tokyo's quiet hours and discover what the city only reveals after dark.",
    poster: portrait("photo-1536440136628-849c177e76a1"),
    backdrop: land("photo-1480714378408-67cf0d13bc1b"),
    cast: [],
  },
  {
    id: "obsidian-protocol",
    title: "Obsidian Protocol",
    year: 2025,
    rating: 8.6,
    ageRating: "18+",
    duration: "2h 32m",
    type: "Movie",
    genres: ["Action", "Thriller"],
    description:
      "An ex-intelligence operative is pulled back in when a black ops file resurfaces in the wrong hands.",
    poster: portrait("photo-1626814026160-2237a95fc5a0"),
    backdrop: land("photo-1478720568477-152d9b164e26"),
    cast: [],
  },
  {
    id: "silver-tide",
    title: "Silver Tide",
    year: 2023,
    rating: 7.4,
    ageRating: "12+",
    duration: "1h 56m",
    type: "Movie",
    genres: ["Adventure", "Drama"],
    description:
      "A solo sailor pursues a centuries-old maritime myth across the open Atlantic.",
    poster: portrait("photo-1518131672697-613becd4fab5"),
    backdrop: land("photo-1505142468610-359e7d316be0"),
    cast: [],
  },
  {
    id: "porcelain-hearts",
    title: "Porcelain Hearts",
    year: 2024,
    rating: 7.9,
    ageRating: "15+",
    duration: "2h 02m",
    type: "Movie",
    genres: ["Drama", "Mystery"],
    description:
      "A renowned restorer is hired to repair an antique vase — and unwittingly inherits its dark family history.",
    poster: portrait("photo-1485846234645-a62644f84728"),
    backdrop: land("photo-1489599849927-2ee91cede3ba"),
    cast: [],
  },
  {
    id: "northern-lights",
    title: "Northern Lights",
    year: 2025,
    rating: 8.2,
    ageRating: "12+",
    duration: "1h 39m",
    type: "Movie",
    genres: ["Documentary"],
    description:
      "A breathtaking journey across the Arctic, told through the eyes of those who call it home.",
    poster: portrait("photo-1483728642387-6c3bdd6c93e5"),
    backdrop: land("photo-1483728642387-6c3bdd6c93e5"),
    cast: [],
  },
];

export const series: Movie[] = [
  {
    id: "neon-paradox",
    title: "The Neon Paradox",
    year: 2024,
    rating: 8.4,
    ageRating: "18+",
    seasons: 1,
    type: "Series",
    genres: ["Sci-Fi", "Thriller"],
    description: featured.description,
    poster: portrait("photo-1635805737707-575885ab0820"),
    backdrop: featured.backdrop,
    cast: featured.cast,
  },
  {
    id: "halcyon-house",
    title: "Halcyon House",
    year: 2025,
    rating: 8.7,
    ageRating: "16+",
    seasons: 2,
    type: "Series",
    genres: ["Drama", "Mystery"],
    description:
      "A reclusive family opens the doors of their estate — and the ghosts that have lived there for generations.",
    poster: portrait("photo-1502139214982-d0ad755818d8"),
    backdrop: land("photo-1505765050516-f72dcac9c60e"),
    cast: [],
  },
  {
    id: "atlas-falling",
    title: "Atlas, Falling",
    year: 2024,
    rating: 8.0,
    ageRating: "15+",
    seasons: 3,
    type: "Series",
    genres: ["Drama"],
    description:
      "A tech founder's empire begins to crack under the weight of the truths he has buried.",
    poster: portrait("photo-1492144534655-ae79c964c9d7"),
    backdrop: land("photo-1519681393784-d120267933ba"),
    cast: [],
  },
  {
    id: "after-the-quiet",
    title: "After The Quiet",
    year: 2025,
    rating: 7.6,
    ageRating: "15+",
    seasons: 1,
    type: "Series",
    genres: ["Thriller"],
    description:
      "In a small town where nothing ever happens, the disappearance of a teacher unravels everything.",
    poster: portrait("photo-1524985069026-dd778a71c7b4"),
    backdrop: land("photo-1485095329183-d0797cdc5676"),
    cast: [],
  },
  {
    id: "kingdoms-of-ash",
    title: "Kingdoms of Ash",
    year: 2024,
    rating: 8.9,
    ageRating: "18+",
    seasons: 2,
    type: "Series",
    genres: ["Fantasy", "Action"],
    description:
      "Two rival heirs must forge an unlikely alliance as an ancient threat awakens in the north.",
    poster: portrait("photo-1518709268805-4e9042af9f23"),
    backdrop: land("photo-1518709268805-4e9042af9f23"),
    cast: [],
  },
];

export const all = [...series, ...movies];

export const findById = (id: string) =>
  all.find((m) => m.id === id) ?? featured;
