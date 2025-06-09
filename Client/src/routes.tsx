import {
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  useNavigate,
  useRouterState,
  useSearch,
} from "@tanstack/react-router";
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

// Define search params schema for root route
interface RootSearchParams {
  join_kitchen?: string;
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
  const search = useSearch({ from: "__root__" }) as RootSearchParams;

  useEffect(() => {
    if (
      !user &&
      routerState.location.pathname !== "/login" &&
      routerState.location.pathname !== "/register"
    ) {
      // Preserve search params when redirecting to login
      navigate({
        to: "/login",
        search: search, // Keep the search params (including join_kitchen)
        replace: true,
      });
    }
  }, [user, routerState.location.pathname, navigate, search]);

  return <AppLayout />;
};

// Root route with search params validation
const rootRoute = createRootRoute({
  validateSearch: (search: Record<string, unknown>): RootSearchParams => ({
    join_kitchen: search?.join_kitchen as string | undefined,
  }),
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

// Updated login route to preserve search params
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

// Updated register route to preserve search params
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

const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  recipeSelectionRoute,
  recipeFlowRoute,
  registerRoute,
  addProductsRoute,
  shoppingListRoute,
  notFoundRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
  defaultPendingComponent: () => <div>Loading...</div>,
});

export type {
  AddProductsLocationState,
  RecipeSelectionLocationState,
  RecipeFlowLocationState,
  RootSearchParams,
};
