import { countUsage } from "./usageAudit";

const SUPABASE_RENDER_MARKER = "/storage/v1/render/image/public/";
const SUPABASE_OBJECT_MARKER = "/storage/v1/object/public/";

type ImageSource = { uri: string };

const normalizedUrlCache = new Map<string, string | null>();
const imageSourceCache = new Map<string, ImageSource>();

export function devLog(message: string, details?: unknown) {
  if (__DEV__) {
    if (details === undefined) {
      console.log(message);
    } else {
      console.log(message, details);
    }
  }
}

function stripQueryAndHash(url: string) {
  return url.split("#")[0].split("?")[0];
}

function normalizeSupabaseRenderUrl(url: string) {
  const markerIndex = url.indexOf(SUPABASE_RENDER_MARKER);

  if (markerIndex === -1) return url;

  const prefix = url.slice(0, markerIndex);
  const objectPath = stripQueryAndHash(
    url.slice(markerIndex + SUPABASE_RENDER_MARKER.length)
  );

  if (!objectPath) return null;

  const normalizedUrl = `${prefix}${SUPABASE_OBJECT_MARKER}${objectPath}`;

  devLog("[media] normalized Supabase render URL to public object URL", {
    from: url,
    to: normalizedUrl,
  });
  countUsage("image-url-normalized-from-render");

  return normalizedUrl;
}

export function normalizeMediaUri(uri?: string | null) {
  if (typeof uri !== "string") return null;

  const trimmedUri = uri.trim();

  if (!trimmedUri || trimmedUri === "undefined" || trimmedUri === "null") {
    devLog("[media] skipped empty media URI", uri);
    countUsage("image-url-skipped-empty");
    return null;
  }

  const cachedUri = normalizedUrlCache.get(trimmedUri);

  if (cachedUri !== undefined) return cachedUri;

  if (trimmedUri.startsWith("blob:")) {
    normalizedUrlCache.set(trimmedUri, null);
    devLog("[media] skipped blob media URI", trimmedUri);
    countUsage("image-url-skipped-blob");
    return null;
  }

  const normalizedSupabaseUrl = normalizeSupabaseRenderUrl(trimmedUri);

  if (!normalizedSupabaseUrl) {
    normalizedUrlCache.set(trimmedUri, null);
    devLog("[media] skipped invalid Supabase render media URI", trimmedUri);
    countUsage("image-url-skipped-invalid-render");
    return null;
  }

  const isLocalUri =
    normalizedSupabaseUrl.startsWith("file:") ||
    normalizedSupabaseUrl.startsWith("content:") ||
    normalizedSupabaseUrl.startsWith("data:image/");

  if (isLocalUri) {
    normalizedUrlCache.set(trimmedUri, normalizedSupabaseUrl);
    return normalizedSupabaseUrl;
  }

  try {
    const parsedUrl = new URL(normalizedSupabaseUrl);
    const validProtocol = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";

    if (!validProtocol || !parsedUrl.hostname || parsedUrl.pathname.endsWith("/")) {
      normalizedUrlCache.set(trimmedUri, null);
      devLog("[media] skipped malformed remote media URI", normalizedSupabaseUrl);
      countUsage("image-url-skipped-malformed");
      return null;
    }

    const safeUrl = parsedUrl.toString();

    normalizedUrlCache.set(trimmedUri, safeUrl);

    if (safeUrl !== trimmedUri) {
      normalizedUrlCache.set(safeUrl, safeUrl);
    }

    return safeUrl;
  } catch {
    normalizedUrlCache.set(trimmedUri, null);
    devLog("[media] skipped unparsable media URI", trimmedUri);
    countUsage("image-url-skipped-unparsable");
    return null;
  }
}

export function getStableImageSource(uri?: string | null, context = "image") {
  const normalizedUri = normalizeMediaUri(uri);

  if (!normalizedUri) {
    devLog(`[media] skipped invalid ${context}`, uri);
    countUsage(`image-skipped:${context}`);
    return undefined;
  }

  const cachedSource = imageSourceCache.get(normalizedUri);

  if (cachedSource) return cachedSource;

  const source = { uri: normalizedUri };

  imageSourceCache.set(normalizedUri, source);
  devLog(`[media] using stable ${context}`, normalizedUri);
  countUsage(`image-source-created:${context}`);

  return source;
}
