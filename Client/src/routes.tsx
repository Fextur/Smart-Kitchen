import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import UserSettings from "@/components/UserSettings";
import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home/Home";
import Login from "@/pages/Login";
import { useEffect } from "react";
import Register from "@/pages/Register";
import { KitchenItem, Recipe } from "@/types";
import { useUser } from "@/hooks/useUser";
import AddProducts from "@/pages/AddProducts/AddProducts";
import ShoppingList from "@/pages/ShoppingList/ShoppingList";
import RecipeSelection from "@/pages/Recipe/RecipeSelection/RecipeSelection";
import RecipeFlow from "@/pages/Recipe/RecipeFlow/RecipeFlow";

interface AddProductsLocationState {
  items: KitchenItem[];
  isFromScan: boolean;
}

interface RecipeSelectionLocationState {
  servings: number;
}

interface RecipeFlowLocationState {
  servings: number;
  recipe: Recipe;
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    addProducts?: AddProductsLocationState;
    recipeSelection?: RecipeSelectionLocationState;
    recipeFlow?: RecipeFlowLocationState;
  }
}

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

const addProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/add-products",
  component: AddProducts,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const recipeSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipe",
  component: RecipeSelection,
});

const recipeFlowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipe/$recipeId",
  component: RecipeFlow,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});

const shoppingListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shopping-list",
  component: ShoppingList,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <Navigate to="/" />,
});

const userSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: UserSettings,
});


const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  recipeSelectionRoute,
  recipeFlowRoute,
  registerRoute,
  addProductsRoute,
  shoppingListRoute,
  userSettingsRoute,
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
});

export type {
  AddProductsLocationState,
  RecipeSelectionLocationState,
  RecipeFlowLocationState,
};
