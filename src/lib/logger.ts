import { reportClientError } from './monitoring'

type LogMetadata = Record<string, unknown> | undefined

const isDevMode = import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true'
const isBrowserConsoleEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_BROWSER_CONSOLE === 'true'
const extensionAsyncChannelClosedMessage =
  'A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received'

let browserNoiseFilterInstalled = false

const shouldWriteToConsole = (): boolean => {
  return isDevMode && isBrowserConsoleEnabled
}

const toConsoleArgs = (metadata?: LogMetadata): unknown[] => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return []
  }

  return [metadata]
}

const toErrorMessage = (value: unknown): string => {
  if (value instanceof Error) {
    return value.message
  }

  if (typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && 'message' in value) {
    const maybeMessage = (value as { message?: unknown }).message
    if (typeof maybeMessage === 'string') {
      return maybeMessage
    }
  }

  return ''
}

const isKnownBrowserExtensionNoise = (value: unknown): boolean => {
  return toErrorMessage(value).includes(extensionAsyncChannelClosedMessage)
}

export const suppressKnownBrowserNoise = (): void => {
  if (browserNoiseFilterInstalled || typeof window === 'undefined') {
    return
  }

  browserNoiseFilterInstalled = true

  window.addEventListener('unhandledrejection', (event) => {
    if (!isKnownBrowserExtensionNoise(event.reason)) {
      return
    }

    event.preventDefault()
  })

  window.addEventListener(
    'error',
    (event) => {
      const candidate = event.error ?? event.message
      if (!isKnownBrowserExtensionNoise(candidate)) {
        return
      }

      event.preventDefault()
    },
    true
  )
}

export const hardenBrowserConsole = (): void => {
  if (!import.meta.env.PROD || isBrowserConsoleEnabled) {
    return
  }

  const silent = (): void => {}
  const methods: Array<'debug' | 'log' | 'info' | 'warn' | 'error' | 'trace'> = [
    'debug',
    'log',
    'info',
    'warn',
    'error',
    'trace',
  ]

  methods.forEach((method) => {
    try {
      const mutableConsole = globalThis.console as unknown as Record<string, (...args: unknown[]) => void>
      mutableConsole[method] = silent
    } catch {
      // Ignore assignment errors in locked-down environments.
    }
  })
}

export const appLogger = {
  debug: (message: string, metadata?: LogMetadata): void => {
    if (!shouldWriteToConsole()) return
    console.debug(message, ...toConsoleArgs(metadata))
  },

  info: (message: string, metadata?: LogMetadata): void => {
    if (!shouldWriteToConsole()) return
    console.info(message, ...toConsoleArgs(metadata))
  },

  warn: (message: string, metadata?: LogMetadata): void => {
    if (!shouldWriteToConsole()) return
    console.warn(message, ...toConsoleArgs(metadata))
  },

  error: (message: string, error?: unknown, metadata?: LogMetadata): void => {
    reportClientError(error ?? message, {
      message,
      ...(metadata ?? {}),
    })

    if (!shouldWriteToConsole()) return

    if (error !== undefined) {
      console.error(message, error, ...toConsoleArgs(metadata))
      return
    }

    console.error(message, ...toConsoleArgs(metadata))
  },
}
