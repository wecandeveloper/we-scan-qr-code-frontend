import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import i18n from './Services/i18n_new.js'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'

import configureStore from './Store/configureStore.js';
import { AuthProvider } from './Context/AuthContext.jsx'
import { Provider } from 'react-redux'
import { I18nextProvider } from "react-i18next";

const store = configureStore()
console.log(store.getState())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Provider store={store}>
        <I18nextProvider i18n={i18n}>
        <App />
        </I18nextProvider>
        </Provider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)