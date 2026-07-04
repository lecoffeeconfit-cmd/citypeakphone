import { supabase } from "../../supabase";

const SUPABASE_STORAGE_MARKER = "/storage/v1/object/public/";
const mediaPreviewUrlCache = new Map<string, string>();

export function devLog(message: string, details?: unknown) {
  if (__DEV__) {
    if (details === undefined) {
      console.log(message);
    } else {
      console.log(message, details);
    }
  }
}

function getStorageObjectPath(publicUrl: string) {
  const markerIndex = publicUrl.indexOf(SUPABASE_STORAGE_MARKER);

  if (markerIndex === -1) return null;

  const objectPath = publicUrl.slice(markerIndex + SUPABASE_STORAGE_MARKER.length);
  const [, ...pathParts] = objectPath.split("?")[0].split("/");

  if (pathParts.length === 0) return null;

  return decodeURIComponent(pathParts.join("/"));
}

export function getFeedImagePreviewUrl(uri?: string) {
  if (!uri || uri.startsWith("blob:")) return uri;

  const cachedUrl = mediaPreviewUrlCache.get(uri);

  if (cachedUrl) return cachedUrl;

  const storagePath = getStorageObjectPath(uri);

  if (!storagePath) {
    mediaPreviewUrlCache.set(uri, uri);
    return uri;
  }

  const { data } = supabase.storage.from("images").getPublicUrl(storagePath, {
    transform: {
      width: 720,
      height: 720,
      resize: "contain",
      quality: 70,
    },
  });

  mediaPreviewUrlCache.set(uri, data.publicUrl);
  devLog("[media] generated cached feed preview URL", storagePath);

  return data.publicUrl;
}
