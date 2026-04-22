import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = '@hermes_api_url';
const API_TOKEN_KEY = '@hermes_api_token';

const DEFAULT_URL = 'https://hermes.sharathchenna.top';
const DEFAULT_TOKEN = 'ios-app-secret-key-change-this-in-production';

export async function getApiUrl(): Promise<string> {
  try {
    const url = await AsyncStorage.getItem(API_URL_KEY);
    return url || DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
}

export async function setApiUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(API_URL_KEY, url);
}

export async function getApiToken(): Promise<string> {
  try {
    const token = await AsyncStorage.getItem(API_TOKEN_KEY);
    return token || DEFAULT_TOKEN;
  } catch {
    return DEFAULT_TOKEN;
  }
}

export async function setApiToken(token: string): Promise<void> {
  await AsyncStorage.setItem(API_TOKEN_KEY, token);
}

export async function loadApiConfig(): Promise<{ url: string; token: string }> {
  const [url, token] = await Promise.all([getApiUrl(), getApiToken()]);
  return { url, token };
}
