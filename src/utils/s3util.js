export async function probeImageUrl(url) {
  try {
    // HEAD is best, but some S3 setups don’t allow it for presigned urls
    let res = await fetch(url, { method: 'HEAD' });

    // fallback to GET if HEAD not allowed
    if (res.status === 403 || res.status === 405) {
      res = await fetch(url, { method: 'GET' });
    }

    return res.status; // 200, 403, 404, ...
  } catch (e) {
    console.error('Error probing image URL:', e);
    return 0; // network error / CORS blocked / aborted
  }
}