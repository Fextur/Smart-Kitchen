import { FC, use, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { useKitchenItems } from "@/hooks/useKitchenItems";
import Loader from "@/components/Loader";
import HomeFooter from "@/pages/Home/HomeFooter";
import ConfirmFooter from "@/components/ConfirmFooter";
import { useRouter } from "@tanstack/react-router";
import { KitchenItemList } from "@/components/KitchenItemList/KitchenItemList";
const ShoppingList: FC = () => {
  const { categorizedItems, isLoading, updateItemsMutation } =
    useKitchenItems();
  const router = useRouter();
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
          bgcolor: "transparent",
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
          <Typography variant="h1">רשימת קניות</Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            px: 2,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <KitchenItemList
              items={!categorizedItems ? [] : categorizedItems.empty}
              title="נגמרו במטבח"
              // onEditItem={handleEditItem}
            />
          </Box>
        </Box>
      </Box>

      <ConfirmFooter onAccept={() => {}} onBack={() => router.history.go(-1)} />
    </div>
  );
};

export default ShoppingList;
