import { FC, useMemo, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useKitchenItems } from "@/hooks/useKitchenItems";
import { KitchenItemList } from "@/components/KitchenItemList/KitchenItemList";
import Loader from "@/components/Loader";
import { isExpiringSoon } from "@/utils/dateUtils";
import HomeFooter from "@/pages/Home/HomeFooter";
import { KitchenItem } from "@/types";
import { useUser } from "@/hooks/useUser";

const Home: FC = () => {
  const { items, isLoading, updateItemsMutation } = useKitchenItems();
  const { user } = useUser();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour > 4 && hour < 12) {
      return "בוקר טוב";
    } else if (hour >= 12 && hour < 17) {
      return "צהריים טובים";
    } else if (hour >= 17 && hour < 21) {
      return "ערב טוב";
    } else {
      return "לילה טוב";
    }
  }, []);

  const categorizedItems = useMemo(() => {
    const expiringSoon = items.filter(
      (item) => item.expirationDate && isExpiringSoon(item.expirationDate)
    );

    const empty = items
      .filter((item) => item.size === 0)
      .map((item) => ({ ...item, expirationDate: undefined }));

    const inKitchen = items.filter((item) => item.size !== 0);

    return { expiringSoon, empty, inKitchen };
  }, [items]);

  const handleEditItem = useCallback(
    (item: KitchenItem) => {
      updateItemsMutation.mutate([item]);
    },
    [updateItemsMutation]
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Box sx={{ textAlign: "center", direction: "rtl" }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            טוען פריטים...
          </Typography>
          <Loader isLoading={isLoading} />
        </Box>
      </Box>
    );
  }

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "75vh",
          bgcolor: "background.default",
          direction: "rtl",
          position: "relative",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            bgcolor: "background.default",
          }}
        >
          <Typography variant="h1">
            {greeting}, {user?.name || "משתמש"}!
          </Typography>
        </Box>

        {items.length === 0 ? (
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 3,
              mx: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <Typography variant="h1" sx={{ fontSize: "32px", mb: 1 }}>
              🍽️
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              אין פריטים במטבח
            </Typography>
            <Typography variant="body2">הוסף פריטים כדי להתחיל</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              px: 2,
            }}
          >
            {categorizedItems.expiringSoon.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <KitchenItemList
                  items={categorizedItems.expiringSoon}
                  title="עומד להתקלקל"
                />
              </Box>
            )}

            {categorizedItems.empty.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <KitchenItemList items={categorizedItems.empty} title="נגמרו" />
              </Box>
            )}

            {categorizedItems.inKitchen.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <KitchenItemList
                  items={categorizedItems.inKitchen}
                  title="במטבח"
                  onEditItem={handleEditItem}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>

      <HomeFooter />
    </div>
  );
};

export default Home;
