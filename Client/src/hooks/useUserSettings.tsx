// Updated useUserSettings hook with proper query invalidation
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { useUser } from "./useUser";
import { useKitchen } from "./useKitchen";

interface UserSettings {
  kitchenName: string;
  kitchenHash: string;
  weight: number;
  height: number;
  goal: string;
  dietaryPreference: string;
  notes: string;
}

interface CreateKitchenResponse {
  inventory: {
    id: string;
    name: string;
  };
  kitchenHash: string;
}

interface JoinKitchenResponse {
  success: boolean;
  inventory?: {
    id: string;
    name: string;
  };
  message: string;
}

export const useUserSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { setKitchen } = useKitchen();

  const fetchUserSettings = async (): Promise<UserSettings> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const { data } = await api.get<UserSettings>(
        `${API_ROUTES.users}/${user.id}/settings`
      );

      return data;
    } catch (error) {
      console.error("Error fetching user settings:", error);
      // Return default values if no settings found
      return {
        kitchenName: "",
        kitchenHash: "",
        weight: 0,
        height: 0,
        goal: "",
        dietaryPreference: "",
        notes: "",
      };
    }
  };

  const updateUserSettings = async (
    settings: Omit<UserSettings, "kitchenName" | "kitchenHash">
  ): Promise<UserSettings> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const { data } = await api.put<UserSettings>(
        `${API_ROUTES.users}/${user.id}/settings`,
        settings
      );

      return data;
    } catch (error) {
      console.error("Error updating user settings:", error);
      throw new Error("Failed to update user settings");
    }
  };

  const createKitchen = async (
    kitchenName: string
  ): Promise<CreateKitchenResponse> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const { data } = await api.post<CreateKitchenResponse>(
        `${API_ROUTES.users}/create-kitchen`,
        {
          userId: user.id,
          name: kitchenName,
        }
      );

      return data;
    } catch (error) {
      console.error("Error creating kitchen:", error);
      throw new Error("Failed to create kitchen. Please try a different name.");
    }
  };

  const joinKitchenByHash = async (
    kitchenHash: string
  ): Promise<JoinKitchenResponse> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const { data } = await api.post<JoinKitchenResponse>(
        `${API_ROUTES.users}/join-kitchen-by-hash`,
        {
          userId: user.id,
          kitchenHash,
        }
      );

      return data;
    } catch (error) {
      console.error("Error joining kitchen:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response?.status === "number" &&
        (error as any).response.status === 400
      ) {
        throw new Error("Invalid kitchen code format");
      }
      throw new Error(
        "Failed to join kitchen. Please check the code and try again."
      );
    }
  };

  const getKitchenHash = async (): Promise<{
    kitchenHash: string;
    kitchenName: string;
  }> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      const { data } = await api.get<{
        kitchenHash: string;
        kitchenName: string;
      }>(`${API_ROUTES.users}/${user.id}/kitchen-hash`);

      return data;
    } catch (error) {
      console.error("Error fetching kitchen hash:", error);
      throw new Error("Failed to get kitchen hash");
    }
  };

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["userSettings", user?.id],
    queryFn: fetchUserSettings,
    enabled: !!user?.id,
  });

  const updateUserSettingsMutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: (error) => {
      console.error("Update user settings error:", error);
    },
  });

  const createKitchenMutation = useMutation({
    mutationFn: createKitchen,
    onSuccess: (data) => {
      // Update kitchen context with new inventory
      setKitchen(data.inventory);

      // Invalidate all kitchen-related queries with new inventory ID
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      queryClient.removeQueries({ queryKey: ["kitchenItems"] });
      queryClient.removeQueries({ queryKey: ["shoppingListItems"] });
      queryClient.removeQueries({ queryKey: ["usedRecipes"] });
      queryClient.invalidateQueries({ queryKey: ["kitchenHash"] });

      // Clear stale data and refetch with new kitchen context
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["kitchenItems"],
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: ["shoppingListItems"],
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: ["usedRecipes"],
          exact: false,
        });
      }, 100);
    },
    onError: (error) => {
      console.error("Create kitchen error:", error);
    },
  });

  const joinKitchenMutation = useMutation({
    mutationFn: joinKitchenByHash,
    onSuccess: (data) => {
      if (data.success && data.inventory) {
        // Update kitchen context with new inventory
        setKitchen(data.inventory);

        // Invalidate all kitchen-related queries with new inventory ID
        queryClient.invalidateQueries({ queryKey: ["userSettings"] });
        queryClient.removeQueries({ queryKey: ["kitchenItems"] });
        queryClient.removeQueries({ queryKey: ["shoppingListItems"] });
        queryClient.removeQueries({ queryKey: ["usedRecipes"] });
        queryClient.invalidateQueries({ queryKey: ["kitchenHash"] });

        // Clear stale data and refetch with new kitchen context
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ["kitchenItems"],
            exact: false,
          });
          queryClient.invalidateQueries({
            queryKey: ["shoppingListItems"],
            exact: false,
          });
          queryClient.invalidateQueries({
            queryKey: ["usedRecipes"],
            exact: false,
          });
        }, 100);
      }
    },
    onError: (error) => {
      console.error("Join kitchen error:", error);
    },
  });

  const getKitchenHashQuery = useQuery({
    queryKey: ["kitchenHash", user?.id],
    queryFn: getKitchenHash,
    enabled: false, // Only fetch when explicitly requested
  });

  return {
    userSettings,
    isLoading,
    updateUserSettingsMutation,
    createKitchenMutation,
    joinKitchenMutation,
    getKitchenHashQuery,
  };
};
