import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layout";
import ErrorPage from "./error";
import HomePage from "./App"
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        children: [],
      },
     
      
    ],
  },
]);
