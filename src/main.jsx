import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

import configureStore from './Store/configureStore.js';
import { AuthProvider } from './Context/AuthContext.jsx'
import { Provider } from 'react-redux'

const store = configureStore()
console.log(store.getState())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Provider store={store}>
        <App />
        </Provider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)