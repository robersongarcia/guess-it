import { Router } from "./Router"
import { SnackbarProvider } from 'notistack'

function App() {

  return (
    <SnackbarProvider>
      <Router />
    </SnackbarProvider>
  )
}

export default App
