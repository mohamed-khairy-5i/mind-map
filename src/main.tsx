import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactFlowProvider } from '@xyflow/react'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import LoadingScreen from './components/LoadingScreen.tsx'
import * as serviceWorker from './utils/serviceWorker'

// Lazy load the main App component for better performance
const App = lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ReactFlowProvider>
        <Suspense fallback={<LoadingScreen />}>
          <App />
        </Suspense>
      </ReactFlowProvider>
    </ErrorBoundary>
  </StrictMode>,
)

// Register service worker for PWA capabilities
serviceWorker.register({
  onSuccess: () => {
    console.log('🎉 MindForge is ready for offline use!')
  },
  onUpdate: () => {
    console.log('🔄 New version of MindForge is available!')
  }
})
