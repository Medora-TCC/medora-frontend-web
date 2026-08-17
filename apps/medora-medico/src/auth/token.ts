const ACCESS_TOKEN_KEY = 'medora_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}
