/**
 * Publishing the community files to Vercel Blob. The pages read them from
 * there at runtime, so new data needs no deploy. A file much smaller than the
 * one online is refused (a half-finished read must not replace a good one),
 * and every upload is read back until the CDN serves it.
 */
import { BlobNotFoundError, del, head, list, put } from "@vercel/blob";

export const BLOB_DIR = "community";

/** The file online now, or null if there is none yet. */
export async function readPublished<T>(path: string, token: string) {
  try {
    const current = await head(path, { token });
    return (await (
      await fetch(`${current.url}?check=${Date.now()}`)
    ).json()) as T;
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

/**
 * Uploads a JSON file and waits until the public URL serves it. `isNew`
 * recognises the uploaded file when read back.
 */
export async function publishJson<T>(
  path: string,
  json: string,
  token: string,
  isNew: (published: T) => boolean
) {
  const blob = await put(path, json, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 3600,
    token,
  });
  // An overwrite can take up to a minute to reach the CDN.
  for (let attempt = 0; attempt < 8; attempt++) {
    if (attempt) await new Promise(resolve => setTimeout(resolve, 15000));
    const published = (await (
      await fetch(`${blob.url}?check=${Date.now()}`)
    ).json()) as T;
    if (isNew(published)) {
      console.log(`Published ${blob.url}`);
      return;
    }
  }
  throw new Error(
    `Uploaded, but ${blob.url} still shows the old data after two minutes.`
  );
}

/** Uploads a file under a name that never changes its contents. */
export async function publishFile(
  path: string,
  body: Buffer,
  contentType: string,
  token: string
) {
  await put(path, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    cacheControlMaxAge: 31536000,
    token,
  });
}

/** Deletes files under a prefix, except the ones named in `keep`. */
export async function removeOthers(
  prefix: string,
  keep: string[],
  token: string
) {
  const stale: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, token });
    for (const blob of page.blobs)
      if (!keep.includes(blob.pathname)) stale.push(blob.url);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  if (stale.length) await del(stale, { token });
  return stale.length;
}
