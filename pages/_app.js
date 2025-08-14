import { Provider } from 'react-redux'
import { AuthProvider } from '../src/context/AuthContext'
import { ToastProvider } from '../src/context/ToastContext'
import { PasskeyProvider } from '../src/context/PasskeyContext'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ErrorBoundary from '../src/components/ErrorBoundary'
import store from '../src/store'
import '../src/styles/globals.css'
import '../src/styles/index.css'
import AuthModal from '@/src/components/ui/AuthModal'

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>
            <PasskeyProvider>
              <DndProvider backend={HTML5Backend}>
                <Component {...pageProps} />
                <AuthModal />
              </DndProvider>
            </PasskeyProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  )
}

export default MyApp