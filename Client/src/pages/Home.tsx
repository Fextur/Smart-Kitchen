import { FC } from "react";
import { Box, Typography } from "@mui/material";
import { useKitchenItems } from "@/hooks/useKitchenItems";
import { KitchenItemList } from "@/components/KitchenItemList/KitchenItemList";
import Loader from "@/components/Loader";
import { isExpiringSoon } from "@/utils/dateUtils";

const Home: FC = () => {
  const { items, isLoading, updateItemMutation } = useKitchenItems();

  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "בוקר טוב";
    } else if (hour < 17) {
      return "צהריים טובים";
    } else if (hour < 21) {
      return "ערב טוב";
    } else {
      return "לילה טוב";
    }
  };

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

  const expiringSoonItems = items.filter(
    (item) => item.expirationDate && isExpiringSoon(item.expirationDate)
  );

  const emptyItems = items
    .filter((item) => item.size === 0)
    .map((item) => ({ ...item, expirationDate: undefined }));

  const inKitchenItems = items.filter((item) => item.size !== 0);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
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
        <Typography variant="h1">{getCurrentTimeGreeting()}, שושן</Typography>
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
          {expiringSoonItems.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <KitchenItemList items={expiringSoonItems} title="עומד להתקלקל" />
            </Box>
          )}

          {emptyItems.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <KitchenItemList items={emptyItems} title="נגמרו" />
            </Box>
          )}

          {inKitchenItems.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <KitchenItemList
                items={inKitchenItems}
                title="במטבח"
                onEditItem={(item) => updateItemMutation.mutate(item)}
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Home;
