import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./routes";
import { PortalProvider } from "./contexts/PortalContext";

const App = () => {
  return (
    <PortalProvider>
      <RouterProvider router={router} />
    </PortalProvider>
  );
};

export default App;