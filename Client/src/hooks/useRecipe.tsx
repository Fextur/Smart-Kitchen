import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { RecipeResponse, User } from "../types";
import api from "../axios/axios";
import { API_ROUTES } from "../axios/apiRoutes";
import { useState } from "react";
import { useUser } from "./useUser";

export const useRecipe = () => {
  const [generatedRecipes, setGeneratedRecipes] = useState<RecipeResponse[]>(
    []
  );
  const { user } = useUser();

  const generateRecipe = async (
    sensitivities: User["sensitivities"],
    preferences: string[]
  ) => {
    try {
      if (user) {
        const { data } = await api.post<RecipeResponse[]>(
          `${API_ROUTES.recipe}/generate`,
          {
            userId: user.id,
            sensitivities,
            preferences,
          }
        );

        return data;
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const { message } = error.response.data;
        console.error("Error creating user:", message);
        throw new Error(message);
      }
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const generatingMutation = useMutation({
    mutationFn: ({
      sensitivities,
      preferences,
    }: {
      sensitivities: User["sensitivities"];
      preferences: string[];
    }) => generateRecipe(sensitivities, preferences),
    onSuccess: (data) => {
      if (data) {
        setGeneratedRecipes(data);
      }
    },
  });

  return {
    recipes: generatedRecipes,
    generateRecipe: generatingMutation.mutate,
    isGenerating: generatingMutation.isPending,
    generateError: generatingMutation.error
      ? generatingMutation.error.message
      : null,
  };
};
