import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GenerateRecipeParams, Recipe, KitchenItem } from "@/types";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { useUser } from "./useUser";
import { useKitchen } from "./useKitchen";

export const useRecipe = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { kitchen } = useKitchen();
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[]>([]);

  const generateRecipe = async (
    params: GenerateRecipeParams
  ): Promise<Recipe[]> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const { data } = await api.post<Recipe[]>(
        `${API_ROUTES.recipes}/generate`,
        {
          userId: user.id,
          servings: params.servings,
          searchQuery: params.searchQuery,
          useOnlyAvailable: params.useOnlyAvailable,
        }
      );

      return data;
    } catch (error) {
      console.error("Recipe generation error:", error);
      throw new Error("Failed to generate recipes");
    }
  };

  const generateRecipeMutation = useMutation({
    mutationFn: generateRecipe,
    onSuccess: (data) => {
      setGeneratedRecipes(data);
    },
    onError: (error) => {
      console.error("Recipe generation error:", error);
    },
  });

  const askQuestion = async (params: {
    stepInstruction: string;
    question: string;
    servings: number;
  }): Promise<string> => {
    try {
      const { data } = await api.post<{ answer: string }>(
        `${API_ROUTES.recipes}/ask-question`,
        {
          stepInstruction: params.stepInstruction,
          question: params.question,
          servings: params.servings,
        }
      );

      return data.answer;
    } catch (error) {
      console.error("Question answering error:", error);
      throw new Error("Failed to get answer");
    }
  };

  const askQuestionMutation = useMutation({
    mutationFn: askQuestion,
    onError: (error) => {
      console.error("Question answering error:", error);
    },
  });

  const fetchUsedRecipes = async (): Promise<Recipe[]> => {
    try {
      if (!user?.id) {
        return [];
      }

      const { data } = await api.get<Recipe[]>(
        `${API_ROUTES.recipes}/history/${user.id}`
      );

      return data.sort((a, b) => {
        const dateA = a.lastAccessedAt
          ? new Date(a.lastAccessedAt).getTime()
          : 0;
        const dateB = b.lastAccessedAt
          ? new Date(b.lastAccessedAt).getTime()
          : 0;
        return dateB - dateA;
      });
    } catch (error) {
      console.error("Fetch used recipes error:", error);
      return [];
    }
  };

  // Use kitchen-specific query key for proper invalidation
  const { data: usedRecipes, isLoading: isUsedRecipesLoading } = useQuery({
    queryKey: ["usedRecipes", user?.id, kitchen?.id],
    queryFn: fetchUsedRecipes,
    enabled: !!user?.id && !!kitchen?.id, // Only fetch when we have both user and kitchen
  });

  const saveRecipe = async (recipe: Recipe): Promise<Recipe> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const { data } = await api.post<Recipe>(`${API_ROUTES.recipes}/save`, {
        ...recipe,
        userId: user.id,
      });

      return data;
    } catch (error) {
      console.error("Save recipe error:", error);
      throw new Error("Failed to save recipe");
    }
  };

  const saveRecipeMutation = useMutation({
    mutationFn: saveRecipe,
    onSuccess: () => {
      // Use kitchen-specific query key
      queryClient.invalidateQueries({
        queryKey: ["usedRecipes", user?.id, kitchen?.id],
      });
    },
    onError: (error) => {
      console.error("Save recipe error:", error);
    },
  });

  const consumeIngredients = async (params: {
    recipeId: string;
    servings: number;
  }): Promise<{ message: string; updatedProducts: KitchenItem[] }> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const { data } = await api.post<{
        message: string;
        updatedProducts: KitchenItem[];
      }>(`${API_ROUTES.recipes}/consume-ingredients`, {
        recipeId: params.recipeId,
        servings: params.servings,
        userId: user.id,
      });

      return data;
    } catch (error) {
      console.error("Consume ingredients error:", error);
      throw new Error("Failed to consume ingredients");
    }
  };

  const consumeIngredientsMutation = useMutation({
    mutationFn: consumeIngredients,
    onSuccess: () => {
      // Use kitchen-specific query key
      queryClient.invalidateQueries({
        queryKey: ["kitchenItems", kitchen?.id],
      });
    },
    onError: (error) => {
      console.error("Consume ingredients error:", error);
    },
  });

  const addMissingToShoppingList = async (params: {
    recipeId: string;
    servings: number;
  }): Promise<{ message: string }> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const { data } = await api.post<{ message: string }>(
        `${API_ROUTES.recipes}/${params.recipeId}/add-missing-to-shopping-list`,
        {
          userId: user.id,
          servings: params.servings,
        }
      );

      return data;
    } catch (error) {
      console.error("Add missing to shopping list error:", error);
      throw new Error("Failed to add missing items to shopping list");
    }
  };

  const addMissingToShoppingListMutation = useMutation({
    mutationFn: addMissingToShoppingList,
    onSuccess: () => {
      // Use kitchen-specific query key
      queryClient.invalidateQueries({
        queryKey: ["shoppingListItems", kitchen?.id],
      });
    },
    onError: (error) => {
      console.error("Add missing to shopping list error:", error);
    },
  });

  const getMissingItems = async (params: {
    recipeId: string;
    servings: number;
  }): Promise<KitchenItem[]> => {
    try {
      const { data } = await api.get<{ missingItems: KitchenItem[] }>(
        `${API_ROUTES.recipes}/${params.recipeId}/missing-items/${params.servings}`
      );

      return data.missingItems;
    } catch (error) {
      console.error("Get missing items error:", error);
      throw new Error("Failed to get missing items");
    }
  };

  const getMissingItemsMutation = useMutation({
    mutationFn: getMissingItems,
    onError: (error) => {
      console.error("Get missing items error:", error);
    },
  });

  const getRecipeWithMissingItems = async (params: {
    recipeId: string;
    servings: number;
  }): Promise<Recipe> => {
    try {
      const { data } = await api.get<Recipe>(
        `${API_ROUTES.recipes}/${params.recipeId}/with-missing-items/${params.servings}`
      );

      return data;
    } catch (error) {
      console.error("Get recipe with missing items error:", error);
      throw new Error("Failed to get recipe with missing items");
    }
  };

  const getRecipeWithMissingItemsMutation = useMutation({
    mutationFn: getRecipeWithMissingItems,
    onError: (error) => {
      console.error("Get recipe with missing items error:", error);
    },
  });

  return {
    generatedRecipes,
    isUsedRecipesLoading,
    usedRecipes,
    generateRecipeMutation,
    askQuestionMutation,
    saveRecipeMutation,
    consumeIngredientsMutation,
    addMissingToShoppingListMutation,
    getMissingItemsMutation,
    getRecipeWithMissingItemsMutation,
  };
};
