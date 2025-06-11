import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "@/types";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/atoms";

// Transform backend alert to frontend format
const transformAlert = (backendAlert: any): Alert => ({
  ...backendAlert,
  message: backendAlert.description || backendAlert.message,
  timestamp: backendAlert.createdAt,
});

export const useAlerts = () => {
  const queryClient = useQueryClient();
  const [user] = useAtom(userAtom);

  // Fetch alerts for the current user (unread only by default)
  const fetchAlerts = async (): Promise<Alert[]> => {
    if (!user?.id) return [];
    
    try {
      const { data } = await api.get(`${API_ROUTES.alerts}/user/${user.id}`);
      return data.map(transformAlert);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw new Error("Failed to fetch alerts");
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async (): Promise<number> => {
    if (!user?.id) return 0;
    
    try {
      const { data } = await api.get(`${API_ROUTES.alerts}/user/${user.id}/unread-count`);
      return data.count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  };

  // React Query for alerts
  const { 
    data: alerts = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: fetchAlerts,
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // React Query for unread count
  const { 
    data: unreadCount = 0 
  } = useQuery({
    queryKey: ['alerts-unread-count', user?.id],
    queryFn: fetchUnreadCount,
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark alert as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await api.put(`${API_ROUTES.alerts}/mark-read`, {
        alertId
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch alerts
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['alerts-unread-count', user?.id] });
    },
    onError: (error) => {
      console.error("Error marking alert as read:", error);
    }
  });
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not found");
      
      const { data } = await api.put(`${API_ROUTES.alerts}/mark-all-read`, {
        userId: user.id
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch alerts
      queryClient.invalidateQueries({ queryKey: ['alerts', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['alerts-unread-count', user?.id] });
    },
    onError: (error) => {
      console.error("Error marking all alerts as read:", error);
    }
  });
  // Helper functions
  const markAsRead = (alertId: string) => {
    markAsReadMutation.mutate(alertId);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return {
    alerts,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
