export async function reverseGeocodeNominatim(lat, lon) {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "PotholeReporter/1.0 (your@email.com)"
      },
      signal: controller.signal
    });

    if (!r.ok) {
      throw new Error(`Nominatim HTTP ${r.status}`);
    }

    return await r.json();
  } catch (err) {
    console.error("Geocoding error:", err.message);
    return null; 
  } finally {
    clearTimeout(timeout);
  }
}

// export async function reverseGeocodeNominatim(lat, lon) {
//   const url =
//     `https://nominatim.openstreetmap.org/reverse` +
//     `?format=jsonv2&lat=${encodeURIComponent(lat)}` +
//     `&lon=${encodeURIComponent(lon)}` +
//     `&zoom=18&addressdetails=1`;

//   const r = await fetch(url, {
//     headers: {
//       "User-Agent":
//         process.env.NOMINATIM_USER_AGENT ||
//         "PotholeReporter/1.0 (contact: raul.ga24@gmail.com",
//       "Accept-Language": "en",
//     },
//   });

//   if (!r.ok) {
//     const text = await r.text().catch(() => "");
//     throw new Error(`Nominatim failed (${r.status}): ${text}`);
//   }

//   return r.json();
// }
