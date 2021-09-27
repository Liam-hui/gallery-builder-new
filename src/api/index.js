import axios from 'axios'

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {

  config.baseURL = window.baseURL

  const headers = { ...config.headers }

  return { ...config, headers }
})

export default api
