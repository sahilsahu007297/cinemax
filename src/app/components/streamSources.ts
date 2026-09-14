/**
 * Stream Source Fetcher — Cinejoy-style direct stream URL resolution
 *
 * Instead of embedding third-party iframes, this module fetches
 * direct m3u8/mp4 stream URLs from multiple free providers.
 * The NativePlayer then plays these via HLS.js — no ads, instant playback.
 */

export interface StreamSource {
  url: string;
  quality: string;
  source: string;
}

interface VidLinkResponse {
  status?: string;
  data?: {
    source?: string;
    sources?: Array<{ file: string; label?: string; type?: string }>;
  };
}

/**
 * Try to fetch a direct stream URL from VidSrc-compatible APIs.
 * These return JSON with m3u8 URLs instead of embedding an iframe.
 */
async function tryVidsrcApi(
  tmdbId: number,
  type: "movie" | "tv",
  season?: number,
  episode?: number
): Promise<StreamSource | null> {
  const endpoints = [
    // vidsrc.xyz JSON API
    type === "tv"
      ? `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`
      : `https://vidsrc.xyz/embed/movie/${tmdbId}`,
  ];

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        headers: {
          "Accept": "application/json, text/html",
          "Referer": "https://vidsrc.xyz/",
        },
      });
      if (!resp.ok) continue;

      const contentType = resp.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await resp.json();
        if (data?.source) {
          return { url: data.source, quality: "Auto", source: "VidSrc API" };
        }
        if (data?.sources?.[0]?.file) {
          return {
            url: data.sources[0].file,
            quality: data.sources[0].label || "Auto",
            source: "VidSrc API",
          };
        }
      }
    } catch {
      // Try next endpoint
    }
  }
  return null;
}

/**
 * Try to extract a stream URL from autoembed.co's API.
 */
async function tryAutoEmbedApi(
  tmdbId: number,
  type: "movie" | "tv",
  season?: number,
  episode?: number
): Promise<StreamSource | null> {
  const path =
    type === "tv"
      ? `https://autoembed.co/api/getVideoSource?type=tv&id=${tmdbId}&s=${season}&e=${episode}`
      : `https://autoembed.co/api/getVideoSource?type=movie&id=${tmdbId}`;

  try {
    const resp = await fetch(path, {
      headers: {
        "Accept": "application/json",
        "Referer": "https://autoembed.co/",
      },
    });
    if (!resp.ok) return null;

    const data = await resp.json();
    if (data?.videoSource) {
      return { url: data.videoSource, quality: "Auto", source: "AutoEmbed" };
    }
  } catch {
    // Silently fail
  }
  return null;
}

/**
 * Try to extract stream from superembed.stream API.
 */
async function trySuperEmbedApi(
  tmdbId: number,
  type: "movie" | "tv",
  season?: number,
  episode?: number
): Promise<StreamSource | null> {
  const path =
    type === "tv"
      ? `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
      : `https://multiembed.mov/directstream.php?video_id=${tmdbId}&tmdb=1`;

  try {
    const resp = await fetch(path, {
      headers: {
        "Accept": "application/json",
        "Referer": "https://multiembed.mov/",
      },
    });
    if (!resp.ok) return null;

    const data = await resp.json();
    if (data?.url || data?.source) {
      return { url: data.url || data.source, quality: "Auto", source: "MultiEmbed Direct" };
    }
  } catch {
    // Silently fail
  }
  return null;
}

/**
 * Master function: try all providers and return the first working stream.
 * Falls back to null if no direct stream can be found (iframe fallback should be used).
 */
export async function fetchDirectStream(
  tmdbId: number,
  type: "movie" | "tv",
  season?: number,
  episode?: number
): Promise<StreamSource | null> {
  // Try all providers in parallel for speed
  const results = await Promise.allSettled([
    tryVidsrcApi(tmdbId, type, season, episode),
    tryAutoEmbedApi(tmdbId, type, season, episode),
    trySuperEmbedApi(tmdbId, type, season, episode),
  ]);

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      return result.value;
    }
  }

  return null;
}

/**
 * Check if a stream URL is valid/reachable via a HEAD request.
 */
export async function validateStream(url: string): Promise<boolean> {
  try {
    const resp = await fetch(url, { method: "HEAD", mode: "no-cors" });
    return true; // no-cors always returns opaque, but no error = reachable
  } catch {
    return false;
  }
}
