import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = '@hermes_api_url';
const API_TOKEN_KEY = '@hermes_api_token';

const DEFAULT_URL = 'https://hermes.sharathchenna.top';
const DEFAULT_TOKEN = 'ios-app-secret-key-change-this-in-production';

export async function getApiUrl(): Promise<string> {
  try {
    const url = await AsyncStorage.getItem(API_URL_KEY);
    // Return empty string if nothing saved (user hasn't configured yet)
    return url ?? '';
  } catch {
    return '';
  }
}

export async function setApiUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(API_URL_KEY, url);
}

export async function getApiToken(): Promise<string> {
  try {
    const token = await AsyncStorage.getItem(API_TOKEN_KEY);
    // Return empty string if nothing saved (user hasn't configured yet)
    return token ?? '';
  } catch {
    return '';
  }
}

export async function setApiToken(token: string): Promise<void> {
  await AsyncStorage.setItem(API_TOKEN_KEY, token);
}

export async function loadApiConfig(): Promise<{ url: string; token: string }> {
  const [url, token] = await Promise.all([getApiUrl(), getApiToken()]);
  return { url, token };
}

// Returns true if both URL and token are available (either configured or using defaults)
export async function isConfigured(): Promise<boolean> {
  const url = await getEffectiveUrl();
  const token = await getEffectiveToken();
  return url.trim().length > 0 && token.trim().length > 0;
}

// Returns the effective URL (falls back to default only for display/placeholder)
export async function getEffectiveUrl(): Promise<string> {
  const url = await getApiUrl();
  return url.trim() || DEFAULT_URL;
}

// Returns the effective token (falls back to default only for display/placeholder)
export async function getEffectiveToken(): Promise<string> {
  const token = await getApiToken();
  return token.trim() || DEFAULT_TOKEN;
}
