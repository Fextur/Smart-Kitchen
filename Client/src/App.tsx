import "./App.css";
import Home from "./pages/Home";
import QueryProvider from "./providers/QueryProvider";

const App: React.FC = () => {
  return (
    <QueryProvider>
      <Home />;
    </QueryProvider>
  );
};

export default App;
