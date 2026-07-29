import 'react-app-polyfill/stable'
import 'core-js'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { Provider } from 'react-redux'
import store from './store'

function hideAppSplash() {
  const splash = document.getElementById('app-splash')
  if (!splash) return
  splash.classList.add('app-splash--hide')
  window.setTimeout(() => splash.remove(), 250)
}

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>,
)

hideAppSplash()

  // If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
