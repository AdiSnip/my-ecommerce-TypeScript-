import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'
import { store } from './store/store.ts'

createRoot(document.getElementById('root')!).render(
   <Provider store={store}>
      <BrowserRouter>
         <App />
         <Toaster position="top-center" reverseOrder={false} />
      </BrowserRouter>
   </Provider>
)
