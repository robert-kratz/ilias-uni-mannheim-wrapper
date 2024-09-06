import "./index.css";

import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./app/App";
import { store } from "./app/store";

const ElectronApplication: React.FC = () => {
  return (
    <>
      <Provider store={store}>
        <App />
      </Provider>
    </>
  );
};

const domNode = document.getElementById("root");
const root = createRoot(domNode);
root.render(<ElectronApplication />);
