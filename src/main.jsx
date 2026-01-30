import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ChakraProvider } from '@chakra-ui/react'
import "./i18n"
import { BrowserRouter } from 'react-router-dom'
import theme from './theme'
import TitleManager from './utils/tools/TitleManager.js'
createRoot(document.getElementById('root')).render(
  <ChakraProvider theme={theme}>
    <BrowserRouter>
      <TitleManager/>
      <App />
    </BrowserRouter>
  </ChakraProvider>
)
