import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { GenerateRecipeParams, Recipe, SizeUnit } from "@/types";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { useUser } from "./useUser";

const STUB_OLD_RECIPES: Recipe[] = [
  {
    id: "old-1",
    name: "פסטה ברוטב עגבניות",
    description: "פסטה איטלקית קלאסית",
    totalTimeMinutes: 25,
    missingItems: [
      {
        id: "1",
        name: "חרטה",
        size: 1,
        measureUnit: SizeUnit.UNIT,
        latestUpdateDate: "2024-05-20",
      },
      {
        id: "14",
        name: "קאקא",
        size: 1,
        measureUnit: SizeUnit.UNIT,
        latestUpdateDate: "2024-05-20",
      },
      {
        id: "15",
        name: "כיפה",
        size: 1,
        measureUnit: SizeUnit.UNIT,
        latestUpdateDate: "2024-05-20",
      },
      {
        id: "61",
        name: "ילד",
        size: 1,
        measureUnit: SizeUnit.UNIT,
        latestUpdateDate: "2024-05-20",
      },
    ],
    ingredients: [
      { name: "פסטה", baseAmount: 200, perServingAmount: 100, unit: "גרם" },
      {
        name: "רוטב עגבניות",
        baseAmount: 200,
        perServingAmount: 100,
        unit: "מ״ל",
      },
      { name: "שום", baseAmount: 2, perServingAmount: 1, unit: "שיני" },
      { name: "בזיליקום", baseAmount: 5, perServingAmount: 2, unit: "עלים" },
    ],
    steps: [
      { stepNumber: 1, instruction: "הרתח סיר מים עם מלח", isTimerStep: false },
      {
        stepNumber: 2,
        instruction: "בשל פסטה 10 דקות",
        isTimerStep: true,
        timerMinutes: 10,
      },
      { stepNumber: 3, instruction: "חמם רוטב במחבת", isTimerStep: false },
      { stepNumber: 4, instruction: "ערבב פסטה עם רוטב", isTimerStep: false },
    ],
    lastAccessedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "old-2",
    missingItems: [],
    name: "סלט ירקות טרי",
    description: "סלט בריא וצבעוני",
    totalTimeMinutes: 15,
    ingredients: [
      { name: "חסה", baseAmount: 1, perServingAmount: 0.5, unit: "יחידות" },
      { name: "עגבנייה", baseAmount: 2, perServingAmount: 1, unit: "יחידות" },
      { name: "מלפפון", baseAmount: 1, perServingAmount: 0.5, unit: "יחידות" },
      {
        name: "לימון",
        baseAmount: 0.5,
        perServingAmount: 0.25,
        unit: "יחידות",
      },
    ],
    steps: [
      { stepNumber: 1, instruction: "חתוך ירקות לקוביות", isTimerStep: false },
      { stepNumber: 2, instruction: "סחט לימון", isTimerStep: false },
      { stepNumber: 3, instruction: "ערבב הכל יחד", isTimerStep: false },
    ],
    lastAccessedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export const useRecipe = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
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
          sensitivities: user.sensitivities || [],
          preferences: params.preferences,
          servings: params.servings,
          searchQuery: params.searchQuery,
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
      return STUB_OLD_RECIPES;
    } catch (error) {
      console.error("Fetch used recipes error:", error);
      return [];
    }
  };

  const { data: usedRecipes, isLoading: isUsedRecipesLoading } = useQuery({
    queryKey: ["usedRecipes", user?.id],
    queryFn: fetchUsedRecipes,
    enabled: !!user?.id,
  });

  const saveRecipe = async (recipe: Recipe): Promise<Recipe> => {
    try {
      return recipe;
    } catch (error) {
      console.error("Save recipe error:", error);
      throw new Error("Failed to save recipe");
    }
  };

  const saveRecipeMutation = useMutation({
    mutationFn: saveRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usedRecipes"] });
    },
    onError: (error) => {
      console.error("Save recipe error:", error);
    },
  });

  return {
    generatedRecipes,
    isUsedRecipesLoading,
    usedRecipes,
    generateRecipeMutation,
    askQuestionMutation,
    saveRecipeMutation,
  };
};
