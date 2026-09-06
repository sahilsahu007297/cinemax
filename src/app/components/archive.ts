const SEARCH_BASE = "https://archive.org/advancedsearch.php";
const METADATA_BASE = "https://archive.org/metadata";
const DOWNLOAD_BASE = "https://archive.org/download";

type ArchiveSearchDoc = {
  identifier: string;
  title?: string;
  year?: string;
  date?: string;
  collection?: string | string[];
  subject?: string | string[];
  licenseurl?: string;
  rights?: string;
  description?: string;
};

type ArchiveSearchResponse = {
  response?: {
    docs?: ArchiveSearchDoc[];
  };
};

type ArchiveFile = {
  name: string;
  format?: string;
  source?: string;
  size?: string;
};

type ArchiveMetadataResponse = {
  metadata?: {
    identifier?: string;
    title?: string;
    year?: string;
    date?: string;
    collection?: string | string[];
    subject?: string | string[];
    licenseurl?: string;
    rights?: string;
    description?: string;
  };
  files?: ArchiveFile[];
};

export type ArchiveStream = {
  identifier: string;
  title: string;
  streamUrl: string;
  sourceUrl: string;
  license?: string;
  rights?: string;
  year?: string;
  fileName: string;
};

export type ArchiveCatalogItem = {
  identifier: string;
  title: string;
  year?: string;
  description?: string;
  posterUrl: string;
};

const streamableFormats = ["h.264", "mpeg4", "512kb mpeg4"];
const trustedCollections = ["feature_films", "classic_tv", "opensource_movies", "prelinger"];

const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const asArray = (value?: string | string[]) =>
  Array.isArray(value) ? value : value ? [value] : [];

const hasRightsSignal = (item: Pick<ArchiveSearchDoc, "collection" | "subject" | "licenseurl" | "rights">) => {
  const haystack = [
    ...asArray(item.collection),
    ...asArray(item.subject),
    item.licenseurl,
    item.rights,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    Boolean(item.licenseurl) ||
    haystack.includes("public domain") ||
    haystack.includes("creative commons") ||
    trustedCollections.some((collection) => haystack.includes(collection))
  );
};

const buildFileUrl = (identifier: string, fileName: string) =>
  `${DOWNLOAD_BASE}/${encodeURIComponent(identifier)}/${fileName
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;

const chooseVideoFile = (files: ArchiveFile[] = []) =>
  files
    .filter((file) => {
      const name = file.name.toLowerCase();
      const format = (file.format || "").toLowerCase();
      return name.endsWith(".mp4") && streamableFormats.some((candidate) => format.includes(candidate));
    })
    .sort((a, b) => {
      const aFormat = (a.format || "").toLowerCase();
      const bFormat = (b.format || "").toLowerCase();
      const aScore = aFormat.includes("h.264") ? 0 : aFormat.includes("mpeg4") ? 1 : 2;
      const bScore = bFormat.includes("h.264") ? 0 : bFormat.includes("mpeg4") ? 1 : 2;
      return aScore - bScore;
    })[0];

const archiveSearch = async (query: string) => {
  const url = new URL(SEARCH_BASE);
  url.searchParams.set("q", query);
  url.searchParams.set("output", "json");
  url.searchParams.set("rows", "8");
  url.searchParams.set("page", "1");
  url.searchParams.set("sort[]", "downloads desc");
  [
    "identifier",
    "title",
    "year",
    "date",
    "collection",
    "subject",
    "licenseurl",
    "rights",
    "description",
  ].forEach((field) => url.searchParams.append("fl[]", field));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Internet Archive search ${res.status}`);
  const json = (await res.json()) as ArchiveSearchResponse;
  return json.response?.docs || [];
};

const archiveMetadata = async (identifier: string) => {
  const res = await fetch(`${METADATA_BASE}/${encodeURIComponent(identifier)}`);
  if (!res.ok) throw new Error(`Internet Archive metadata ${res.status}`);
  return (await res.json()) as ArchiveMetadataResponse;
};

export async function getArchiveStreamByIdentifier(identifier: string): Promise<ArchiveStream | null> {
  const metadata = await archiveMetadata(identifier);
  const file = chooseVideoFile(metadata.files);
  const itemMetadata = metadata.metadata;

  if (!file || !itemMetadata || !hasRightsSignal(itemMetadata)) return null;

  return {
    identifier,
    title: itemMetadata.title || identifier,
    streamUrl: buildFileUrl(identifier, file.name),
    sourceUrl: `https://archive.org/details/${encodeURIComponent(identifier)}`,
    license: itemMetadata.licenseurl,
    rights: itemMetadata.rights,
    year: itemMetadata.year || String(itemMetadata.date || "").slice(0, 4),
    fileName: file.name,
  };
}

const scoreCandidate = (doc: ArchiveSearchDoc, title: string, year?: number) => {
  const normalizedDocTitle = normalize(doc.title);
  const normalizedTitle = normalize(title);
  const docYear = Number(doc.year || String(doc.date || "").slice(0, 4));
  let score = 0;

  if (normalizedDocTitle === normalizedTitle) score += 8;
  if (normalizedDocTitle.includes(normalizedTitle)) score += 4;
  if (year && docYear && Math.abs(docYear - year) <= 1) score += 2;
  if (hasRightsSignal(doc)) score += 3;

  return score;
};

const buildQueries = (title: string, type: "movie" | "tv") => {
  const safeTitle = title.replace(/"/g, "");
  const collectionQuery =
    type === "tv"
      ? '(collection:(classic_tv) OR subject:("classic television") OR subject:("public domain"))'
      : '(collection:(feature_films) OR collection:(opensource_movies) OR subject:("public domain") OR licenseurl:*)';

  return [
    `title:("${safeTitle}") AND mediatype:(movies) AND ${collectionQuery}`,
    `"${safeTitle}" AND mediatype:(movies) AND ${collectionQuery}`,
  ];
};

export async function findArchiveStream(
  title: string,
  type: "movie" | "tv",
  year?: number
): Promise<ArchiveStream | null> {
  const docs = (
    await Promise.all(buildQueries(title, type).map((query) => archiveSearch(query).catch(() => [])))
  )
    .flat()
    .filter((doc, index, all) => all.findIndex((item) => item.identifier === doc.identifier) === index)
    .filter((doc) => doc.identifier && hasRightsSignal(doc))
    .sort((a, b) => scoreCandidate(b, title, year) - scoreCandidate(a, title, year));

  for (const doc of docs.slice(0, 5)) {
    const metadata = await archiveMetadata(doc.identifier).catch(() => null);
    const file = chooseVideoFile(metadata?.files);
    const itemMetadata = metadata?.metadata || doc;

    if (!file || !hasRightsSignal(itemMetadata)) continue;

    return {
      identifier: doc.identifier,
      title: itemMetadata.title || doc.title || title,
      streamUrl: buildFileUrl(doc.identifier, file.name),
      sourceUrl: `https://archive.org/details/${encodeURIComponent(doc.identifier)}`,
      license: itemMetadata.licenseurl,
      rights: itemMetadata.rights,
      year: itemMetadata.year || String(itemMetadata.date || "").slice(0, 4),
      fileName: file.name,
    };
  }

  return null;
}

export async function getArchiveCatalog(type: "movie" | "tv" = "movie"): Promise<ArchiveCatalogItem[]> {
  const query =
    type === "tv"
      ? 'mediatype:(movies) AND collection:(classic_tv)'
      : 'mediatype:(movies) AND (collection:(feature_films) OR collection:(opensource_movies))';

  const docs = (await archiveSearch(query))
    .filter((doc) => doc.identifier && doc.title && hasRightsSignal(doc))
    .slice(0, 12);

  return docs.map((doc) => ({
    identifier: doc.identifier,
    title: doc.title || doc.identifier,
    year: doc.year || String(doc.date || "").slice(0, 4),
    description: doc.description,
    posterUrl: `https://archive.org/services/img/${encodeURIComponent(doc.identifier)}`,
  }));
}
