import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'success' | 'info'
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
}) => {
  const iconConfig = {
    danger: {
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    },
    info: {
      icon: Info,
      bgColor: 'bg-zinc-100',
      iconColor: 'text-zinc-600',
      buttonClass: 'bg-zinc-900 hover:bg-zinc-800 focus:ring-zinc-500',
    },
  }

  const config = iconConfig[type]
  const Icon = config.icon

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all sm:my-8 sm:w-full sm:max-w-md">
                {/* Close button */}
                <button
                  type="button"
                  className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 transition-colors"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <Dialog.Title as="h3" className="text-lg font-semibold text-zinc-900">
                        {title}
                      </Dialog.Title>
                      <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{message}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-zinc-100 bg-zinc-50/50 px-6 py-4">
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.buttonClass}`}
                    onClick={onConfirm}
                  >
                    {confirmText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default ConfirmModal

