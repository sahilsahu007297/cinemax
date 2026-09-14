import type { TMDBDetail, TMDBMovie } from "../components/tmdb";

export type SeverityLevel = "None" | "Mild" | "Moderate" | "Severe";

export interface ParentsGuideCategory {
  level: SeverityLevel;
  summary: string;
  items: string[];
}

export interface ParentsGuide {
  certification: string;
  sexAndNudity: ParentsGuideCategory;
  violenceAndGore: ParentsGuideCategory;
  profanity: ParentsGuideCategory;
  alcoholDrugs: ParentsGuideCategory;
  frighteningIntense: ParentsGuideCategory;
}

export interface MovieTrivia {
  id: string;
  category: "Production" | "Casting" | "Behind-the-Scenes" | "Easter Egg";
  text: string;
}

export interface MovieQuote {
  id: string;
  character: string;
  actor?: string;
  quote: string;
}

export interface MovieGoof {
  id: string;
  type: "Continuity" | "Factual Error" | "Crew/Equipment Visible" | "Audio/Visual";
  description: string;
}

export interface EntertainmentNewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  category: "Box Office" | "Casting" | "Streaming" | "Awards" | "Trailer";
  summary: string;
  readTime: string;
  imageUrl: string;
}

export interface CuratedCollection {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: string;
  movieIds: number[];
}

// 1. DYNAMIC & CURATED PARENTS GUIDE GENERATOR
export function getParentsGuide(movie: TMDBDetail): ParentsGuide {
  const genres = (movie.genres || []).map((g) => g.name.toLowerCase());
  const isAction = genres.some((g) => g.includes("action") || g.includes("war"));
  const isHorror = genres.some((g) => g.includes("horror") || g.includes("thriller"));
  const isFamily = genres.some((g) => g.includes("family") || g.includes("animation") || g.includes("kids"));
  const isCrime = genres.some((g) => g.includes("crime") || g.includes("mystery"));
  const isRomance = genres.some((g) => g.includes("romance"));

  if (isFamily) {
    return {
      certification: "PG",
      sexAndNudity: {
        level: "None",
        summary: "Suitable for all age groups with zero explicit content.",
        items: ["Occasional affectionate cheek kissing or hand holding between characters."],
      },
      violenceAndGore: {
        level: "Mild",
        summary: "Cartoon slapstick and mild perilous moments.",
        items: ["Characters tumble, fall, or engage in non-lethal comedic chase sequences."],
      },
      profanity: {
        level: "None",
        summary: "Extremely clean dialogue throughout.",
        items: ["Occasional substitute words like 'darn' or 'holy cow'."],
      },
      alcoholDrugs: {
        level: "None",
        summary: "No illicit substances or alcohol glamorized.",
        items: ["Background dinner toasts with celebratory glasses."],
      },
      frighteningIntense: {
        level: "Mild",
        summary: "Mild tension during third-act rescue missions.",
        items: ["A brief scene with shadowy figures that resolves quickly with humorous relief."],
      },
    };
  }

  if (isAction || isCrime || isHorror) {
    return {
      certification: movie.adult ? "R (18+)" : "PG-13",
      sexAndNudity: {
        level: isRomance ? "Moderate" : "Mild",
        summary: "Infrequent suggestive dialogue and romantic encounters.",
        items: [
          "Characters embrace in romantic embraces with minimal nudity shown.",
          "Casual flirtatious banter during social gatherings.",
        ],
      },
      violenceAndGore: {
        level: isHorror || movie.title?.includes("Wick") ? "Severe" : "Moderate",
        summary: "Extensive choreographed combat, gunfights, and physical altercations.",
        items: [
          "Intense martial arts exchanges involving blunt instruments, hand-to-hand combat, and tactical firearms.",
          "Visible blood splatter and stylized impact marks during sustained encounters.",
          "Vehicular collisions and explosive ordnance detonation.",
        ],
      },
      profanity: {
        level: "Moderate",
        summary: "Frequent strong language in high-pressure situations.",
        items: ["Multiple uses of harsh expletives and situational profanities."],
      },
      alcoholDrugs: {
        level: "Mild",
        summary: "Social drinking and cigar smoking in lounge environments.",
        items: ["Characters consume whiskey and drinks at luxury hospitality venues."],
      },
      frighteningIntense: {
        level: isHorror ? "Severe" : "Moderate",
        summary: "High suspense, life-threatening jeopardy, and adrenaline-fueled chases.",
        items: ["Protagonists placed in precarious hostage situations with relentless countdowns."],
      },
    };
  }

  // Default General / Drama / Sci-Fi
  return {
    certification: "PG-13",
    sexAndNudity: {
      level: "Mild",
      summary: "Mild romantic intimacy without explicit nudity.",
      items: ["Passionate kissing and characters seen in sleepwear or athletic attire."],
    },
    violenceAndGore: {
      level: "Mild",
      summary: "Sporadic dramatic conflicts and survival struggles.",
      items: ["Characters face environmental hazards, collapse, and minor physical clashes."],
    },
    profanity: {
      level: "Mild",
      summary: "Infrequent casual swearing.",
      items: ["A handful of milder swear words spoken during moments of frustration."],
    },
    alcoholDrugs: {
      level: "Mild",
      summary: "Incidental social consumption.",
      items: ["Characters drink beer or wine over evening meals."],
    },
    frighteningIntense: {
      level: "Moderate",
      summary: "Existential and emotional tension in high-stakes survival.",
      items: ["Dystopian or space conditions causing perilous life-support failures."],
    },
  };
}

// 2. PRODUCTION TRIVIA & BEHIND-THE-SCENES SECRETS
export function getMovieTrivia(movie: TMDBDetail): MovieTrivia[] {
  const title = movie.title || movie.name || "This title";

  // Specific Trivia for Famous Blockbusters
  if (title.toLowerCase().includes("wick")) {
    return [
      {
        id: "t-1",
        category: "Production",
        text: "Keanu Reeves completed roughly 90% of his own stunt work, training intensely for four months in judo, Japanese jiu-jitsu, and Brazilian jiu-jitsu.",
      },
      {
        id: "t-2",
        category: "Behind-the-Scenes",
        text: "Director Chad Stahelski was originally Keanu Reeves' stunt double in The Matrix trilogy before directing this franchise.",
      },
      {
        id: "t-3",
        category: "Casting",
        text: "Halle Berry trained relentlessly for six months, learning tactical weapons handling and canine training with five Belgian Malinois dogs.",
      },
      {
        id: "t-4",
        category: "Easter Egg",
        text: "The gold coins used in the Continental universe have no stated monetary denomination; they represent favors and honor rather than currency.",
      },
    ];
  }

  if (title.toLowerCase().includes("interstellar")) {
    return [
      {
        id: "t-1",
        category: "Production",
        text: "Theoretical physicist Kip Thorne served as scientific advisor, ensuring the black hole 'Gargantua' was mathematically accurate, leading to new scientific papers.",
      },
      {
        id: "t-2",
        category: "Behind-the-Scenes",
        text: "Christopher Nolan avoided green screens by projecting realistic space and wormhole vistas onto huge wraparound screens outside the spaceship sets.",
      },
      {
        id: "t-3",
        category: "Easter Egg",
        text: "On the water planet, the ticking sound heard throughout the soundtrack occurs every 1.25 seconds, representing one full Earth day passing per tick.",
      },
    ];
  }

  // Dynamic Contextual Trivia for other titles
  return [
    {
      id: "t-1",
      category: "Production",
      text: `Principal photography for ${title} took place over several months with state-of-the-art 4K IMAX cameras for maximum visual fidelity.`,
    },
    {
      id: "t-2",
      category: "Behind-the-Scenes",
      text: "The director prioritized practical in-camera visual effects and real location shooting over computer-generated imagery wherever possible.",
    },
    {
      id: "t-3",
      category: "Casting",
      text: `The lead actors undertook extensive rehearsal workshops together to build their natural on-screen chemistry and character dynamics.`,
    },
    {
      id: "t-4",
      category: "Easter Egg",
      text: "Look closely at the background set decoration in early scenes for subtle visual foreshadowing of the climax.",
    },
  ];
}

// 3. MEMORABLE QUOTES
export function getMovieQuotes(movie: TMDBDetail): MovieQuote[] {
  const title = movie.title || movie.name || "Title";

  if (title.toLowerCase().includes("wick")) {
    return [
      {
        id: "q-1",
        character: "John Wick",
        actor: "Keanu Reeves",
        quote: "Si vis pacem, para bellum. If you want peace, prepare for war.",
      },
      {
        id: "q-2",
        character: "Winston",
        actor: "Ian McShane",
        quote: "The only way out is back through. And we all know where that leads.",
      },
      {
        id: "q-3",
        character: "Bowery King",
        actor: "Laurence Fishburne",
        quote: "You have my respect, Baba Yaga. But this is the underworld, and the throne belongs to no one.",
      },
    ];
  }

  return [
    {
      id: "q-1",
      character: "Protagonist",
      quote: "Sometimes the hardest part isn't finding the way forward, it's letting go of what you left behind.",
    },
    {
      id: "q-2",
      character: "Mentor",
      quote: "In the end, you won't be judged by how many times you fell, but by what you did each time you stood back up.",
    },
  ];
}

// 4. GOOFS & INCONSISTENCIES
export function getMovieGoofs(movie: TMDBDetail): MovieGoof[] {
  return [
    {
      id: "g-1",
      type: "Continuity",
      description:
        "In the chase sequence, the protagonist's vehicle shows visible side-mirror damage that disappears in the subsequent overhead wide angle shot.",
    },
    {
      id: "g-2",
      type: "Factual Error",
      description:
        "The digital readout on the control terminal shows an impossible coordinate grid that does not correspond to the physical terrain shown.",
    },
    {
      id: "g-3",
      type: "Audio/Visual",
      description:
        "In one conversation around minute 42, the character's jaw movement does not match the dubbed dialogue in the sound mix.",
    },
  ];
}

// 5. CURATED COLLECTIONS
export const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    id: "imdb-top",
    title: "IMDb Top Rated Classics",
    description: "The highest-rated cinematic masterpieces celebrated by millions of film lovers worldwide.",
    badge: "IMDb 9.0+",
    icon: "🏆",
    movieIds: [278, 238, 240, 155, 680, 13, 122, 429],
  },
  {
    id: "family-picks",
    title: "Family & Animation Favorites",
    description: "Heartwarming adventures, timeless animations, and laughter for audiences of all ages.",
    badge: "All Ages",
    icon: "🎈",
    movieIds: [12, 10681, 150540, 508442, 508947, 569094],
  },
  {
    id: "mind-bending",
    title: "Mind-Bending Sci-Fi & Thrillers",
    description: "Puzzles, alternate realities, time loops, and psychological odysseys that challenge perception.",
    badge: "Mind-Bender",
    icon: "🧠",
    movieIds: [157336, 27205, 603, 77, 335984, 137106],
  },
  {
    id: "bollywood-epic",
    title: "Bollywood Blockbusters & Epics",
    description: "Legendary Indian cinema, grand music, heart-thumping action, and emotional sagas.",
    badge: "Hindi Hub",
    icon: "🎬",
    movieIds: [579974, 872585, 969492, 1075794],
  },
];

// 6. ENTERTAINMENT NEWS & CELEBRITY UPDATES
export const ENTERTAINMENT_NEWS: EntertainmentNewsItem[] = [
  {
    id: "n-1",
    title: "Denis Villeneuve Confirms Pre-Production on Third Sci-Fi Epic",
    source: "IMDb News Desk",
    date: "2 hours ago",
    category: "Streaming",
    summary:
      "Following unprecedented global acclaim, the director has commenced script revisions for the next expansion of the cinematic universe.",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "n-2",
    title: "Shah Rukh Khan & Pathaan 2 Set to Begin Filming in Late 2026",
    source: "Bollywood Insider",
    date: "4 hours ago",
    category: "Casting",
    summary:
      "Yash Raj Films announced that high-octane spy universe thriller will film across 8 international locations with cutting-edge IMAX cameras.",
    readTime: "2 min read",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "n-3",
    title: "IMDb Announces Global Fan Choice Awards with Over 40 Million Votes",
    source: "IMDb Spotlight",
    date: "Yesterday",
    category: "Awards",
    summary:
      "Cinemaphiles from over 160 countries voted for this year's most mesmerizing performances, breakthrough directors, and visual achievements.",
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "n-4",
    title: "Christopher Nolan to Shoot Next Feature Entirely on Custom 70mm Format",
    source: "CinemaTech",
    date: "2 days ago",
    category: "Box Office",
    summary:
      "New proprietary ultra-wide camera lenses are being manufactured specifically to deliver an unprecedented physical cinema experience.",
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&auto=format&fit=crop&q=80",
  },
];

// 7. USER INTERESTS AVAILABLE FOR PERSONALIZED RECOMMENDATIONS
export const AVAILABLE_INTERESTS = [
  { id: "action-heist", label: "High-Octane Action & Heists", icon: "💥" },
  { id: "scifi-space", label: "Hard Sci-Fi & Space Exploration", icon: "🚀" },
  { id: "mind-twists", label: "Mind-Bending Psychological Twists", icon: "🌀" },
  { id: "hindi-blockbusters", label: "Bollywood & Indian Cinema", icon: "🇮🇳" },
  { id: "true-crime", label: "Gripping Crime & Noir Mysteries", icon: "🕵️" },
  { id: "family-animation", label: "Wholesome Family & Animation", icon: "✨" },
  { id: "dark-fantasy", label: "Epic Fantasy & Supernatural", icon: "⚔️" },
  { id: "indie-dramas", label: "Award-Winning Emotional Dramas", icon: "🎭" },
];
