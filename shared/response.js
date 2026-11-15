// Helper response JSON untuk semua API functions.
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers },
  });
}

export function err(message, status = 400, extra = {}) {
  return json({ error: message, ...extra }, status);
}
