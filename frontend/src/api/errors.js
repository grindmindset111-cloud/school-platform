export function getApiErrorMessage(err, fallback = 'Request failed') {
  const status = err.response?.status
  const message =
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message

  if (!err.response) {
    return 'Network error. Check the backend URL and connection.'
  }

  if (status === 401) {
    return 'Your session has expired. Please log in again.'
  }

  if (status === 403) {
    return 'You are not authorized to access this resource.'
  }

  if (status === 404) {
    return 'The requested resource was not found.'
  }

  if (status >= 500) {
    return 'The server could not complete this request. Please try again later.'
  }

  return message || fallback
}
