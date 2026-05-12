import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  addUserActionBreadcrumb,
  setMonitoringUser,
  trackUserAction,
} from '../../lib/monitoring'

const trackedKeywords = [
  'ingresar',
  'login',
  'editar',
  'guardar',
  'eliminar',
  'crear',
  'actualizar',
  'enviar',
  'registrar',
  'pagar',
  'matricular',
  'asignar',
  'activar',
]

const normalizeLabel = (raw: string): string => {
  return raw.replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 120)
}

const extractActionLabel = (target: HTMLElement): string | null => {
  const clickable = target.closest(
    'button, a, [role="button"], input[type="submit"], input[type="button"]'
  ) as HTMLElement | null

  if (!clickable) return null

  const fromAttribute =
    clickable.getAttribute('data-sentry-action') ||
    clickable.getAttribute('aria-label') ||
    clickable.getAttribute('title')

  let label = fromAttribute || ''

  if (!label && clickable instanceof HTMLInputElement) {
    label = clickable.value || ''
  }

  if (!label) {
    label = clickable.textContent || ''
  }

  const normalized = normalizeLabel(label)
  if (!normalized) return null

  if (clickable.hasAttribute('data-sentry-capture')) {
    return normalized
  }

  if (trackedKeywords.some((keyword) => normalized.includes(keyword))) {
    return normalized
  }

  return null
}

const ObservabilityTracker = () => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const previousRouteRef = useRef<string>('')

  useEffect(() => {
    const currentRoute = `${location.pathname}${location.search}`

    if (currentRoute === previousRouteRef.current) {
      return
    }

    previousRouteRef.current = currentRoute

    const metadata = {
      path: location.pathname,
      search: location.search || undefined,
    }

    addUserActionBreadcrumb('navigation.change', metadata)
    trackUserAction('navigation.change', metadata, 'success')
  }, [location.pathname, location.search])

  useEffect(() => {
    if (isAuthenticated && user) {
      setMonitoringUser({
        id: user.id,
        email: user.email,
        name: user.nombreCompleto,
        role: user.rol,
      })
      return
    }

    setMonitoringUser(null)
  }, [isAuthenticated, user])

  useEffect(() => {
    const onClick = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof HTMLElement)) return

      const label = extractActionLabel(target)
      if (!label) return

      const metadata = {
        label,
        path: window.location.pathname,
      }

      addUserActionBreadcrumb('ui.click', metadata)
      trackUserAction('ui.click', metadata, 'success')
    }

    const onSubmit = (event: Event): void => {
      const target = event.target
      if (!(target instanceof HTMLFormElement)) return

      const metadata = {
        path: window.location.pathname,
        formId: target.id || undefined,
        formName: target.getAttribute('name') || undefined,
      }

      addUserActionBreadcrumb('ui.submit', metadata)
      trackUserAction('ui.submit', metadata, 'success')
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('submit', onSubmit, true)

    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('submit', onSubmit, true)
    }
  }, [])

  return null
}

export default ObservabilityTracker
