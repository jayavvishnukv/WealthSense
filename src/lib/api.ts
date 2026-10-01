const apiBaseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');

function resolveApiUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  if (import.meta.env.PROD && !apiBaseUrl) {
    throw new Error('VITE_API_URL must be set to the Render backend URL in production.');
  }
  return apiBaseUrl ? `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}` : url;
}

export async function fetchWithAuth(url: string, token: string | null, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  const response = await fetch(resolveApiUrl(url), {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `HTTP error ${response.status}`);
  }
  
  return response.json();
}
