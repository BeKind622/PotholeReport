export async function reverseGeocodeNominatim(lat, lon) {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?format=jsonv2&lat=${encodeURIComponent(lat)}` +
    `&lon=${encodeURIComponent(lon)}` +
    `&zoom=18&addressdetails=1`;

  const r = await fetch(url, {
    headers: {
      "User-Agent":
        process.env.NOMINATIM_USER_AGENT ||
        "PotholeReporter/1.0 (contact: you@example.com)",
      "Accept-Language": "en",
    },
  });

  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`Nominatim failed (${r.status}): ${text}`);
  }

  return r.json();
}
