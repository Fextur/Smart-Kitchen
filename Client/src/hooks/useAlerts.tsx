import { useState, useEffect } from "react";
import { AlertType } from "@/types";

export type Alert = {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
};

// Dummy data for demonstration
const generateDummyAlerts = (): Alert[] => [
  {
    id: "1",
    type: AlertType.ADD_KITCHEN,
    title: "מטבח חדש נוצר",
    message: "המטבח 'מטבח משפחת כהן' נוצר בהצלחה",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    isRead: false,
    data: { kitchenName: "מטבח משפחת כהן" }
  },
  {
    id: "2",
    type: AlertType.EDIT_KITCHEN,
    title: "המטבח עודכן",
    message: "שם המטבח השתנה ל'המטבח של המשפחה'",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    isRead: false,
    data: { oldName: "מטבח משפחת כהן", newName: "המטבח של המשפחה" }
  },
  {
    id: "3",
    type: AlertType.ADD_TO_SHOPPING_LIST,
    title: "פריט נוסף לרשימת קניות",
    message: "חלב נוסף לרשימת הקניות על ידי דני",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    isRead: false,
    data: { itemName: "חלב", addedBy: "דני" }
  },
  {
    id: "4",
    type: AlertType.EDIT_SHOPPING_LIST,
    title: "רשימת קניות עודכנה",
    message: "הכמות של לחם השתנתה מ-2 ל-3 יחידות",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    isRead: true,
    data: { itemName: "לחם", oldQuantity: 2, newQuantity: 3 }  },
  {
    id: "5",
    type: AlertType.USER_ENTERED_KITCHEN,
    title: "משתמש נכנס למטבח",
    message: "שרה נכנסה למטבח",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    isRead: true,
    data: { userName: "שרה" }
  },
  {
    id: "6",
    type: AlertType.USER_LEFT_KITCHEN,
    title: "משתמש יצא מהמטבח",
    message: "מיכל יצא מהמטבח",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    isRead: true,
    data: { userName: "מיכל" }
  }
];

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate loading alerts - only unread ones
    setIsLoading(true);
    const timer = setTimeout(() => {
      // Filter to only show unread alerts from dummy data
      const unreadAlerts = generateDummyAlerts().filter(alert => !alert.isRead);
      setAlerts(unreadAlerts);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const markAsRead = (alertId: string) => {
    // Remove the alert from the list when marked as read
    setAlerts(prev => 
      prev.filter(alert => alert.id !== alertId)
    );
  };

  const markAllAsRead = () => {
    // Clear all alerts when marking all as read
    setAlerts([]);
  };

  const approveAlert = (alertId: string) => {
    // In a real implementation, this would send a request to the server
    console.log(`Approving alert ${alertId}`);
    markAsRead(alertId);
  };

  const unreadCount = alerts.length; // Since we only show unread alerts

  return {
    alerts,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    approveAlert,
  };
};
