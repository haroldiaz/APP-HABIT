
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Habitos from "./Pages/Habitos";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
    
       
        <Route
          path="/"
          element={<Habitos />}
        />
        
      </Routes>
    </BrowserRouter>
  );
}
