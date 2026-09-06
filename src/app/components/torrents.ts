// Open-source 4K torrents & high-speed direct download resolver
// Uses public open-source APIs (apibay / TPB open index, YTS mirror fallback, WebTorrent bridge)

export interface TorrentItem {
  name: string;
  quality: "4K" | "1080p" | "720p" | "HD";
  resolutionLabel: string;
  size: string;
  seeders: number;
  leechers: number;
  infoHash: string;
  magnet: string;
  webtorUrl: string;
  audio: string;
  source: string;
}

const PUBLIC_TRACKERS = [
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://open.stealth.si:80/announce",
  "udp://tracker.torrent.eu.org:451/announce",
  "udp://tracker.bittor.pw:1337/announce",
  "udp://public.popcorn-tracker.org:6969/announce",
  "udp://tracker.dler.org:6969/announce",
  "udp://exodus.desync.com:6969",
  "udp://open.demonii.com:1337/announce",
  "udp://tracker.openbittorrent.com:80",
];

const trackerQuery = PUBLIC_TRACKERS.map((t) => `&tr=${encodeURIComponent(t)}`).join("");

export function createMagnetLink(hash: string, name: string): string {
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}${trackerQuery}`;
}

export function formatBytes(bytes: number | string): string {
  const num = typeof bytes === "string" ? parseFloat(bytes) : bytes;
  if (!num || isNaN(num) || num <= 0) return "Unknown size";
  const gb = num / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = num / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function detectQuality(name: string): { quality: "4K" | "1080p" | "720p" | "HD"; label: string } {
  const lower = name.toLowerCase();
  if (lower.includes("2160p") || lower.includes("4k") || lower.includes("uhd")) {
    return { quality: "4K", label: "4K Ultra HD (2160p)" };
  }
  if (lower.includes("1080p") || lower.includes("fhd")) {
    return { quality: "1080p", label: "1080p Full HD" };
  }
  if (lower.includes("720p") || lower.includes("hdrip")) {
    return { quality: "720p", label: "720p HD" };
  }
  return { quality: "1080p", label: "1080p HD" };
}

function detectAudio(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("hindi") || lower.includes("hin")) {
    if (lower.includes("5.1") || lower.includes("atmos") || lower.includes("ddp")) {
      return "Hindi 5.1 Surround";
    }
    return "Hindi Audio";
  }
  if (lower.includes("dual") || lower.includes("multi")) {
    return "Dual / Multi-Audio";
  }
  if (lower.includes("atmos")) return "Dolby Atmos";
  if (lower.includes("5.1")) return "5.1 Surround";
  return "Original Audio";
}

// Fetch open torrents from apibay (ThePirateBay public open API)
async function fetchApibay(query: string): Promise<TorrentItem[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://apibay.org/q.php?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0 || (data.length === 1 && data[0].name === "No results returned")) {
      return [];
    }

    return data
      .filter((item) => item.info_hash && item.name && item.info_hash !== "0000000000000000000000000000000000000000")
      .map((item) => {
        const { quality, label } = detectQuality(item.name);
        const magnet = createMagnetLink(item.info_hash, item.name);
        return {
          name: item.name,
          quality,
          resolutionLabel: label,
          size: formatBytes(item.size),
          seeders: parseInt(item.seeders, 10) || 0,
          leechers: parseInt(item.leechers, 10) || 0,
          infoHash: item.info_hash,
          magnet,
          webtorUrl: `https://webtor.io/#/show?magnet=${encodeURIComponent(magnet)}`,
          audio: detectAudio(item.name),
          source: "Open Public Torrent",
        };
      });
  } catch {
    return [];
  }
}

// Fetch from Torrentio Stremio Addon (Indexes 20+ torrent providers like 1337x, RARBG, TorrentGalaxy, YTS, EZTV)
async function fetchTorrentio(
  imdbId?: string | null,
  type: "movie" | "tv" = "movie",
  season?: number,
  episode?: number
): Promise<TorrentItem[]> {
  if (!imdbId) return [];
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const streamPath =
      type === "tv" && season && episode
        ? `series/${imdbId}:${season}:${episode}`
        : `movie/${imdbId}`;

    const res = await fetch(`https://torrentio.strem.fun/stream/${streamPath}.json`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.streams)) return [];

    return data.streams
      .filter((s: any) => s.infoHash)
      .map((s: any) => {
        const lines = (s.title || "").split("\n");
        const fullName = lines[0] || s.behaviorHints?.filename || s.name || "Torrent Stream";

        // Extract seeders: e.g. "👤 284"
        const seedersMatch = (s.title || "").match(/👤\s*(\d+)/);
        const seeders = seedersMatch ? parseInt(seedersMatch[1], 10) : 0;

        // Extract size: e.g. "💾 8.91 GB"
        const sizeMatch = (s.title || "").match(/💾\s*([0-9.]+\s*[GMK]B)/i);
        const size = sizeMatch ? sizeMatch[1] : "Unknown";

        // Extract provider: e.g. "⚙️ 1337x"
        const sourceMatch = (s.title || "").match(/⚙️\s*([^\n]+)/);
        const sourceName = sourceMatch ? sourceMatch[1].trim() : "Torrentio";

        // Detect 4K / 1080p
        const rawMeta = `${s.name || ""} ${s.title || ""}`;
        let quality: "4K" | "1080p" | "720p" | "HD" = "1080p";
        let label = "1080p Full HD";

        if (
          rawMeta.includes("4k") ||
          rawMeta.includes("4K") ||
          rawMeta.includes("2160p") ||
          rawMeta.includes("UHD")
        ) {
          quality = "4K";
          label = rawMeta.includes("HDR")
            ? "4K HDR (2160p)"
            : rawMeta.includes("DV")
            ? "4K Dolby Vision"
            : "4K Ultra HD (2160p)";
        } else if (rawMeta.includes("720p")) {
          quality = "720p";
          label = "720p HD";
        }

        const magnet = createMagnetLink(s.infoHash, fullName);

        return {
          name: fullName,
          quality,
          resolutionLabel: label,
          size,
          seeders,
          leechers: 0,
          infoHash: s.infoHash,
          magnet,
          webtorUrl: `https://webtor.io/#/show?magnet=${encodeURIComponent(magnet)}`,
          audio: detectAudio(rawMeta),
          source: `Torrentio · ${sourceName}`,
        };
      });
  } catch {
    return [];
  }
}

// Fetch YTS torrents as secondary source
async function fetchYTS(title: string, imdbId?: string | null): Promise<TorrentItem[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const query = imdbId || title;
    const res = await fetch(`https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    const movie = data?.data?.movies?.[0];
    if (!movie || !Array.isArray(movie.torrents)) return [];

    return movie.torrents.map((t: any) => {
      const is4k = t.quality === "2160p" || t.quality === "4K";
      const is1080 = t.quality === "1080p";
      const quality: "4K" | "1080p" | "720p" | "HD" = is4k ? "4K" : is1080 ? "1080p" : "720p";
      const label = is4k ? "4K Ultra HD (2160p)" : is1080 ? "1080p Full HD" : "720p HD";
      const fullName = `${movie.title} (${movie.year}) [${t.quality}] [${t.type}]`;
      const magnet = createMagnetLink(t.hash, fullName);

      return {
        name: fullName,
        quality,
        resolutionLabel: label,
        size: t.size || "Unknown",
        seeders: t.seeds || 0,
        leechers: t.peers || 0,
        infoHash: t.hash,
        magnet,
        webtorUrl: `https://webtor.io/#/show?magnet=${encodeURIComponent(magnet)}`,
        audio: "5.1 Surround",
        source: "YTS",
      };
    });
  } catch {
    return [];
  }
}

// Main fetcher combining multiple sources (Torrentio + Apibay + YTS)
export async function searchTorrentsForTitle(
  title: string,
  year?: number,
  imdbId?: string | null,
  type: "movie" | "tv" = "movie",
  season?: number,
  episode?: number
): Promise<TorrentItem[]> {
  const cleanTitle = title.replace(/[^\w\s]/gi, " ").trim();
  const searchQueries = [
    year ? `${cleanTitle} ${year}` : cleanTitle,
    cleanTitle,
  ];

  // Try Torrentio, Apibay, and YTS in parallel
  const [torrentioRes, apibayRes, ytsRes] = await Promise.all([
    fetchTorrentio(imdbId, type, season, episode),
    fetchApibay(searchQueries[0]),
    fetchYTS(cleanTitle, imdbId),
  ]);

  let combined = [...torrentioRes, ...apibayRes, ...ytsRes];

  // If first query didn't yield enough, try second query on Apibay
  if (combined.length === 0 && searchQueries[1] !== searchQueries[0]) {
    const retryApibay = await fetchApibay(searchQueries[1]);
    combined = [...retryApibay];
  }

  // Deduplicate by infoHash
  const seen = new Set<string>();
  const unique = combined.filter((item) => {
    const key = item.infoHash.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: 4K items first, then by seeders count descending
  return unique.sort((a, b) => {
    if (a.quality === "4K" && b.quality !== "4K") return -1;
    if (b.quality === "4K" && a.quality !== "4K") return 1;
    return b.seeders - a.seeders;
  });
}

import { useState, useEffect } from "react";

export function useMovieTorrents(
  title?: string,
  year?: number,
  imdbId?: string | null,
  type: "movie" | "tv" = "movie",
  season?: number,
  episode?: number
) {
  const [torrents, setTorrents] = useState<TorrentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!title) {
      setTorrents([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchTorrentsForTitle(title, year, imdbId, type, season, episode)
      .then((items) => {
        if (!cancelled) setTorrents(items);
      })
      .catch(() => {
        if (!cancelled) setTorrents([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [title, year, imdbId, type, season, episode]);

  return { torrents, loading };
}


