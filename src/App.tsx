import { ThemeProvider } from "@/components/theme-provider"
import "@/App.css";
import Hertz6RouterPageHomePage from "./components/Hertz6RouterPageHomePage";
function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Hertz6RouterPageHomePage/>
    </ThemeProvider>
  )
}

export default App
