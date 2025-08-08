import { Provider } from 'react-redux'
import { AuthProvider } from '../src/context/AuthContext'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ErrorBoundary from '../src/components/ErrorBoundary'
import store from '../src/store'
import '../src/styles/globals.css'
import '../src/styles/index.css'

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <DndProvider backend={HTML5Backend}>
            <Component {...pageProps} />
          </DndProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  )
}

export default MyApp