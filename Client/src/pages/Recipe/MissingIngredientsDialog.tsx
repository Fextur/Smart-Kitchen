import { FC } from "react";
import { Box, Button } from "@mui/material";
import { ShoppingCart, ArrowLeft, AlertCircle } from "lucide-react";
import { Dialog } from "@/components/Dialog";
import { IngredientCard } from "./IngredientCard";
import { Recipe } from "@/types";
import { KitchenItemList } from "@/components/KitchenItemList/KitchenItemList";

interface MissingIngredientsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  onAddToShoppingList: () => void;
  onContinueAnyway: () => void;
}

export const MissingIngredientsDialog: FC<MissingIngredientsDialogProps> = ({
  isOpen,
  onClose,
  recipe,
  onAddToShoppingList,
  onContinueAnyway,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      icon={<AlertCircle size={24} />}
      color="#E49A61"
      title="נראה שאין לך את כל המצרכים למתכון"
    >
      <Box sx={{ direction: "rtl" }}>
        <KitchenItemList
          itemsCount={recipe.missingItems!.length}
          title="המצרכים הבאים חסרים במטבח שלך:"
          initialCollapsed={false}
          renderRow={(index) => (
            <IngredientCard
              ingredientName={recipe.missingItems![index].name}
              ingredientMeasureUnit={recipe.missingItems![index].measureUnit}
              ingredientSize={recipe.missingItems![index].size}
              isMissing
            />
          )}
          maxHeight="100px"
          cardHeight={50}
        />
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1.5 }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={onAddToShoppingList}
            endIcon={<ShoppingCart size={20} />}
            sx={{
              bgcolor: "#E49A61",
              color: "white",
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "14px",
              fontWeight: 500,
              "&:hover": {
                bgcolor: "#E6850E",
              },
            }}
          >
            הכנס את החוסרים לרשימת הקניות
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={onContinueAnyway}
            endIcon={<ArrowLeft size={20} />}
            sx={{
              borderColor: "#E49A61",
              color: "#E49A61",
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 500,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                bgcolor: "rgba(255, 149, 0, 0.1)",
                borderColor: "#E49A61",
              },
            }}
          >
            <div style={{ paddingLeft: "1rem" }}>המשך בכל זאת</div>
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
