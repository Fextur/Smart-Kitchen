import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { useEffect } from "react";
import Register from "./pages/Register";
import { atom } from "jotai";
import { User } from "./types";
import { useUser } from "./hooks/useUser";

export const userAtom = atom<User | null>(null);

const ProtectedLayout = () => {
  const { user } = useUser();
  const routerState = useRouterState();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      !user &&
      routerState.location.pathname !== "/login" &&
      routerState.location.pathname !== "/register"
    ) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, routerState.location.pathname, navigate]);

  return <AppLayout />;
};

const rootRoute = createRootRoute({
  component: ProtectedLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <Navigate to="/" />,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
});
