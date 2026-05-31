import api from '@/api'

const resourcePaths = {
  students: ['/api/students'],
  staff: ['/api/staff', '/api/users'],
  courses: ['/api/courses'],
  attendance: ['/api/attendance'],
  results: ['/api/results'],
  notifications: ['/api/notifications'],
  settings: ['/api/settings'],
}

const dashboardPaths = ['/dashboard', '/api/dashboard']

function normalizePayload(payload) {
  return payload?.data ?? payload
}

function normalizeList(payload) {
  const data = normalizePayload(payload)

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.records)) return data.records
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.users)) return data.users
  if (Array.isArray(data?.staff)) return data.staff
  if (Array.isArray(data?.students)) return data.students
  if (Array.isArray(data?.courses)) return data.courses
  if (Array.isArray(data?.attendance)) return data.attendance
  if (Array.isArray(data?.results)) return data.results
  if (Array.isArray(data?.notifications)) return data.notifications

  return []
}

async function requestFirst(paths, method, body) {
  let lastError

  for (const path of paths) {
    try {
      if (method === 'get' || method === 'delete') {
        return await api[method](path)
      }

      return await api[method](path, body)
    } catch (err) {
      lastError = err
      if (![404, 405].includes(err.response?.status)) {
        throw err
      }
    }
  }

  throw lastError
}

export async function getDashboard() {
  const res = await requestFirst(dashboardPaths, 'get')
  return normalizePayload(res.data)
}

export async function listResource(name) {
  const res = await requestFirst(resourcePaths[name], 'get')
  return normalizeList(res.data)
}

export async function createResource(name, payload) {
  const res = await requestFirst(resourcePaths[name], 'post', payload)
  return normalizePayload(res.data)
}

export async function updateResource(name, id, payload) {
  const paths = resourcePaths[name].map((path) => `${path}/${id}`)
  const res = await requestFirst(paths, 'put', payload)
  return normalizePayload(res.data)
}

export async function deleteResource(name, id) {
  const paths = resourcePaths[name].map((path) => `${path}/${id}`)
  const res = await requestFirst(paths, 'delete')
  return normalizePayload(res.data)
}

export { resourcePaths }
