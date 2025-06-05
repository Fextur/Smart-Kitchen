import RecipeSwipeView from "@/components/RecipeSwipeView";
import { useKitchen } from "@/hooks/useKitchen";
import { useRecipe } from "@/hooks/useRecipe";
import { useShoppingListItems } from "@/hooks/useShoppingListItems";
import { useUser } from "@/hooks/useUser";
import { Preferences } from "@/types";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  IconButton,
  Snackbar,
  TextField,
} from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { ArrowRight, ClipboardPlus } from "lucide-react";
import { useState } from "react";

const RecipeGenerator = () => {
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState<number>(0);
  const [isAddedToShoppingList, setIsAddedToShoppingList] =
    useState<boolean>(false);

  const router = useRouter();
  const { user } = useUser();
  const { generateRecipe, recipes } = useRecipe();
  const { kitchen } = useKitchen();
  const { addItemsMutation } = useShoppingListItems();

  const form = useForm({
    defaultValues: {
      sensitivities: user?.sensitivities ?? [],
      preferences: [] as string[],
    },
    onSubmit: async ({ value }) => {
      generateRecipe(value);
    },
  });

  const currentRecipe = recipes[currentRecipeIndex];
  const hasExtraProducts =
    currentRecipe?.extraProducts && currentRecipe?.extraProducts?.length > 0;

  const addToShoppingList = () => {
    const currentRecipe = recipes[currentRecipeIndex];
    const items = currentRecipe.extraProducts?.map((item) => ({
      ...item,
      latestUpdateDate: new Date().toISOString(),
    }));
    if (kitchen && items) {
      addItemsMutation.mutate(
        {
          inventoryId: kitchen.id,
          items,
        },
        {
          onSuccess: () => {
            setIsAddedToShoppingList(true);
          },
        }
      );
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {recipes && recipes.length > 0 ? (
        <RecipeSwipeView
          recipes={recipes}
          currentRecipeIndex={currentRecipeIndex}
          setCurrentRecipeIndex={setCurrentRecipeIndex}
        />
      ) : (
        <form
          style={{ width: "80vw" }}
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="sensitivities">
            {(field) => (
              <Autocomplete
                multiple
                freeSolo
                defaultValue={user?.sensitivities}
                options={user?.sensitivities ?? []}
                value={field.state.value}
                onChange={(_, newValue) => field.handleChange(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="רגישויות" />
                )}
                sx={{ direction: "rtl", mb: 5, mt: 2 }}
              />
            )}
          </form.Field>

          <form.Field name="preferences">
            {(field) => (
              <Autocomplete
                multiple
                options={Object.values(Preferences)}
                value={field.state.value}
                onChange={(_, newValue) => field.handleChange(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="העדפות" />
                )}
                sx={{ direction: "rtl", mb: 2 }}
              />
            )}
          </form.Field>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, background: "#E49A61" }}
          >
            תכין לי מתכון
          </Button>
        </form>
      )}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 10,
          zIndex: 1000,
          height: "10vh",
          boxSizing: "border-box",
        }}
      >
        <IconButton
          disabled={!hasExtraProducts}
          sx={{
            p: 1,
            borderRadius: 1.5,
          }}
          onClick={addToShoppingList}
        >
          <ClipboardPlus size={32} />
        </IconButton>
        <IconButton
          sx={{
            p: 1,
            borderRadius: 1.5,
          }}
          onClick={() => router.history.go(-1)}
        >
          <ArrowRight size={32} />
        </IconButton>
      </Box>
      <Snackbar
        sx={{ margin: "10px" }}
        autoHideDuration={4000}
        anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
        open={isAddedToShoppingList}
        onClose={() => setIsAddedToShoppingList(false)}
      >
        <Alert severity="success" sx={{ width: "100%", direction: "rtl" }}>
          הפריטים הוספו לרשימת קניות
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RecipeGenerator;
