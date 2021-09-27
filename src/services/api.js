import axios from 'axios';

const api = axios.create({
  // baseURL: baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {

  config.baseURL = await getBaseUrl();

  const headers = { ...config.headers };

  return { ...config, headers };
});

async  function getBaseUrl() {
  return window.baseURL;
}

export default api;