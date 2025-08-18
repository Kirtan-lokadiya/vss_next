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
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getAuthToken } from '@/src/utils/api'

const PUBLIC_ROUTES = new Set(['/login', '/register', '/verify-email']);

const RequireAuth = ({ children }) => {
  const router = useRouter();
  useEffect(() => {
    const token = getAuthToken();
    const path = router.pathname;
    if (!token && !PUBLIC_ROUTES.has(path) && !path.startsWith('/verification')) {
      router.replace('/login');
    }
    if (token && (path === '/login' || path === '/register')) {
      router.replace('/');
    }
  }, [router.pathname]);
  return children;
};

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>
            <PasskeyProvider>
              <DndProvider backend={HTML5Backend}>
                <RequireAuth>
                  <Component {...pageProps} />
                </RequireAuth>
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