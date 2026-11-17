// نشست کاربر در localStorage نگه داشته می‌شود: توکن + زمان انقضا (expires_at از بک‌اند)
const TOKEN = 'access_token'
const EXPIRES = 'expires_at'

export const getToken = () => localStorage.getItem(TOKEN)

export function setSession({ token, expiresAt }) {
  localStorage.setItem(TOKEN, token)
  if (expiresAt) localStorage.setItem(EXPIRES, expiresAt)
  else localStorage.removeItem(EXPIRES)
}

export function clearSession() {
  localStorage.removeItem(TOKEN)
  localStorage.removeItem(EXPIRES)
}

// وارد شده یعنی توکن دارد و منقضی نشده است
export function isLoggedIn() {
  if (!getToken()) return false
  const exp = localStorage.getItem(EXPIRES)
  return !exp || Date.parse(exp) > Date.now()
}
