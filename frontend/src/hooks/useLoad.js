import { useCallback, useEffect, useRef, useState } from 'react'

// یک تابع async را یک‌بار اجرا می‌کند و { data, loading, error, reload } برمی‌گرداند.
// reload() همان تابع را دوباره اجرا می‌کند (داده‌ی قبلی تا رسیدن جواب نگه داشته می‌شود).
export default function useLoad(fn) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const fnRef = useRef(fn)
  const lastRequest = useRef(0) // جواب‌های قدیمی را نادیده می‌گیرد

  const reload = useCallback(() => {
    const id = ++lastRequest.current
    setState((s) => ({ ...s, loading: true }))
    fnRef.current()
      .then((data) => id === lastRequest.current && setState({ data, loading: false, error: null }))
      .catch((e) => id === lastRequest.current && setState((s) => ({ ...s, loading: false, error: e.message })))
  }, [])

  useEffect(() => {
    reload()
    return () => { lastRequest.current++ }
  }, [reload])

  return { ...state, reload }
}
