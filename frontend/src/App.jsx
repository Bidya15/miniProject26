import { AppProvider } from "./context/AppContext";
import { useApp } from "./context/AppContext";
import ConfirmationModal from "./components/ConfirmationModal";
import "./components/ConfirmationModal.css";
import AppShell from "./components/AppShell";
import "./index.css";

function App() {
  return (
    <AppProvider>
      <AppShell />
      <ConfirmationModal />
    </AppProvider>
  );
}

export default App;
