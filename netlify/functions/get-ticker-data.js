// HAND Registry live object-count proxy
// Deployed once (on the primary Netlify site); all websites point their
// widgets at this function's absolute URL. CORS is open because the
// count is public data.

export default async (request, context) => {
  // pageSize=1 — we only need the top-level "size" field, not records
  const jsonApiUrl =
    "https://registry.hand-id.org/objects/?query=*%3A*&pageNum=0&pageSize=1";

  try {
    const response = await fetch(jsonApiUrl, {
      headers: {
        "User-Agent": "HAND-TickerWidget/1.0 (https://hand-id.org; wk@hand-id.org)",
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Registry API returned status ${response.status}`);
    }

    const data = await response.json();
    const totalObjects = data.size || 0;

    return new Response(JSON.stringify({ total: totalObjects }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Netlify CDN serves cached counts for 2 min; stale up to 10 min
        // while revalidating. Cordra sees ~1 request / 2 min total,
        // regardless of visitor volume across all sites.
        "Cache-Control": "public, max-age=120, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
