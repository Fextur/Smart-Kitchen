import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { User } from "../types";
import api from "../axios/axios";
import { API_ROUTES } from "../axios/apiRoutes";
import { useState } from "react";

export const useRecipe = () => {
  const [generatedRecipe, setGeneratedRecipe] = useState<string>("");

  const generateRecipe = async (
    sensitivities: User["sensitivities"],
    preferences: string[]
  ) => {
    try {
      const { data } = await api.post(`${API_ROUTES.recipe}/generate`, {
        sensitivities,
        preferences,
      });

      return data;
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
    onSuccess: (recipe) => {
      setGeneratedRecipe(recipe);
    },
  });

  return {
    recipe: generateRecipe,
    generateRecipe: generatingMutation.mutate,
    isGenerating: generatingMutation.isPending,
    generateError: generatingMutation.error
      ? generatingMutation.error.message
      : null,
  };
};
