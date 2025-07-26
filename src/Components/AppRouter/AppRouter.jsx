import { Route, Routes } from "react-router-dom";
import PrivateRoutes from "../../Context/PrivateRoutes";

export default function AppRouter({ routes }) {
  return (
    <Routes>
      {routes.map(
        // ({ path, element }) => {
        ({ path, element, isProtected = false, roles }) => {
          return (
            <Route
              key={path}
              path={path}
              element={
                isProtected ? (
                  <PrivateRoutes
                    permittedRoles={roles}
                  >
                    {element}
                  </PrivateRoutes>
                ) : (
                  element
                )
              }
            />
          );
        }
      )}
    </Routes>
  );
}
