import * as Sentry from '@sentry/react'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN
const sentryTunnelRoute = import.meta.env.VITE_SENTRY_TUNNEL_ROUTE
const sensitiveKeyPattern = /password|token|authorization|cookie|secret|refresh/i

export type UserActionStatus = 'attempt' | 'success' | 'failure'
export type MonitoringUser = {
  id: number | string
  email?: string
  name?: string
  role?: string
}

const parseTracesSampleRate = (): number => {
  const raw = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? '0.1')
  if (!Number.isFinite(raw)) return 0.1
  return Math.min(Math.max(raw, 0), 1)
}

const parseActionSampleRate = (): number => {
  const raw = Number(import.meta.env.VITE_SENTRY_ACTION_SAMPLE_RATE ?? '1')
  if (!Number.isFinite(raw)) return 1
  return Math.min(Math.max(raw, 0), 1)
}

const parseTunnelRoute = (): string | undefined => {
  const value = sentryTunnelRoute?.trim()
  if (!value) return undefined

  return value.startsWith('/') ? value : `/${value}`
}

const isMonitoringEnabled = (): boolean => {
  return import.meta.env.PROD && typeof sentryDsn === 'string' && sentryDsn.trim().length > 0
}

const toSafeString = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const sanitizeMetadata = (metadata?: Record<string, unknown>): Record<string, string> => {
  if (!metadata) return {}

  return Object.entries(metadata).reduce<Record<string, string>>((acc, [key, value]) => {
    if (sensitiveKeyPattern.test(key)) {
      acc[key] = '[REDACTED]'
      return acc
    }

    acc[key] = toSafeString(value).slice(0, 500)
    return acc
  }, {})
}

const shouldTrackAction = (): boolean => {
  return Math.random() <= parseActionSampleRate()
}

let monitoringInitialized = false

export const initializeMonitoring = (): void => {
  if (monitoringInitialized) return
  monitoringInitialized = true

  if (!isMonitoringEnabled()) return

  Sentry.init({
    dsn: sentryDsn,
    tunnel: parseTunnelRoute(),
    environment: import.meta.env.MODE,
    enabled: true,
    tracesSampleRate: parseTracesSampleRate(),
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request?.headers) {
        const headers = { ...event.request.headers }
        delete headers.Authorization
        delete headers.authorization
        delete headers.Cookie
        delete headers.cookie
        event.request.headers = headers
      }
      return event
    },
  })
}

export const reportClientError = (error: unknown, context?: Record<string, unknown>): void => {
  if (!isMonitoringEnabled()) return

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, toSafeString(value))
      })
    }

    if (error instanceof Error) {
      Sentry.captureException(error)
      return
    }

    Sentry.captureMessage(toSafeString(error) || 'Unknown client error', 'error')
  })
}

export const setMonitoringUser = (user: MonitoringUser | null): void => {
  if (!isMonitoringEnabled()) return

  if (!user) {
    Sentry.setUser(null)
    return
  }

  Sentry.setUser({
    id: String(user.id),
    email: user.email,
    username: user.name,
  })

  if (user.role) {
    Sentry.setTag('user.role', user.role)
  }
}

export const addUserActionBreadcrumb = (
  action: string,
  metadata?: Record<string, unknown>,
  status: UserActionStatus = 'success'
): void => {
  if (!isMonitoringEnabled()) return

  Sentry.addBreadcrumb({
    category: 'user-action',
    message: `${action}.${status}`,
    level: status === 'failure' ? 'error' : 'info',
    data: sanitizeMetadata(metadata),
  })
}

export const trackUserAction = (
  action: string,
  metadata?: Record<string, unknown>,
  status: UserActionStatus = 'success'
): void => {
  if (!isMonitoringEnabled() || !shouldTrackAction()) return

  const sanitized = sanitizeMetadata(metadata)

  Sentry.withScope((scope) => {
    scope.setTag('event.type', 'user-action')
    scope.setTag('action.name', action)
    scope.setTag('action.status', status)

    Object.entries(sanitized).forEach(([key, value]) => {
      scope.setExtra(key, value)
    })

    const level = status === 'failure' ? 'error' : 'info'
    Sentry.captureMessage(`user-action:${action}`, level)
  })
}
