import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { useUser } from "./useUser";

interface UserSettings {
  kitchenName: string;
  weight: number;
  height: number;
  goal: string;
  dietaryPreference: string;
  notes: string;
}

export const useUserSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();

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
        weight: 0,
        height: 0,
        goal: "",
        dietaryPreference: "",
        notes: "",
      };
    }
  };

  const updateUserSettings = async (
    settings: UserSettings
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

  const joinKitchen = async (kitchenName: string): Promise<void> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      await api.post(`${API_ROUTES.users}/join-to-kitchen`, {
        userId: user.id,
        kitchenName,
      });
    } catch (error) {
      console.error("Error joining kitchen:", error);
      throw new Error("Failed to join kitchen. Please check the kitchen name.");
    }
  };

  const createKitchen = async (kitchenName: string): Promise<void> => {
    try {
      if (!user?.id) {
        throw new Error("User not found");
      }

      await api.post(`${API_ROUTES.users}/create-kitchen`, {
        userId: user.id,
        name: kitchenName,
      });
    } catch (error) {
      console.error("Error creating kitchen:", error);
      throw new Error("Failed to create kitchen. Please try a different name.");
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

  const joinKitchenMutation = useMutation({
    mutationFn: joinKitchen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: (error) => {
      console.error("Join kitchen error:", error);
    },
  });

  const createKitchenMutation = useMutation({
    mutationFn: createKitchen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
    onError: (error) => {
      console.error("Create kitchen error:", error);
    },
  });

  return {
    userSettings,
    isLoading,
    updateUserSettingsMutation,
    joinKitchenMutation,
    createKitchenMutation,
  };
};
