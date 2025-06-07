import { FC, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import ConfirmFooter from "@/components/ConfirmFooter";
import { useRecipe } from "@/hooks/useRecipe";
import { Preferences, Recipe } from "@/types";
import { ServingsDialog } from "@/components/ServingsDialog";
import { MissingIngredientsDialog } from "@/pages/Recipe/MissingIngredientsDialog";
import { ItemList } from "@/components/ItemList";
import { RecipeCard } from "./RecipeCard";

interface RecipeSelectionLocationState {
  servings?: number;
}

const RecipeSelection: FC = () => {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const {
    generateRecipeMutation,
    generatedRecipes,
    usedRecipes,
    saveRecipeMutation,
    getRecipeWithMissingItemsMutation,
  } = useRecipe();

  const locationState = routerState.location.state as
    | RecipeSelectionLocationState
    | undefined;
  const servings = locationState?.servings;

  const [showServingsDialog, setShowServingsDialog] = useState(!servings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showMissingDialog, setShowMissingDialog] = useState(false);

  const handleGenerate = () => {
    if (!servings) return;

    generateRecipeMutation.mutate({
      preferences: selectedPreferences as Preferences[],
      servings,
      searchQuery,
    });
  };

  const handleRecipeSelect = async (recipe: Recipe) => {
    if (!servings) return;

    try {
      let recipeWithMissingItems: Recipe;

      if (recipe.id) {
        recipeWithMissingItems =
          await getRecipeWithMissingItemsMutation.mutateAsync({
            recipeId: recipe.id,
            servings,
          });
      } else {
        recipeWithMissingItems = recipe;
      }

      setSelectedRecipe(recipeWithMissingItems);

      if (
        recipeWithMissingItems.missingItems &&
        recipeWithMissingItems.missingItems.length > 0
      ) {
        setShowMissingDialog(true);
      } else {
        navigateToRecipeSteps(recipeWithMissingItems);
      }
    } catch (error) {
      console.error("Failed to get recipe with missing items:", error);
      setSelectedRecipe(recipe);
      if (recipe.missingItems && recipe.missingItems.length > 0) {
        setShowMissingDialog(true);
      } else {
        navigateToRecipeSteps(recipe);
      }
    }
  };

  const navigateToRecipeSteps = (recipe: Recipe) => {
    saveRecipeMutation.mutate(recipe);

    (navigate as any)({
      to: "/recipe/$recipeId",
      params: { recipeId: recipe.id || "new" },
      state: {
        servings,
        recipe,
      },
    });
  };

  const handleContinueAnyway = () => {
    setShowMissingDialog(false);
    if (selectedRecipe) {
      navigateToRecipeSteps(selectedRecipe);
    }
  };

  const handleBack = () => {
    setShowServingsDialog(true);
  };

  const handleServingsConfirm = (selectedServings: number) => {
    setShowServingsDialog(false);
    (navigate as any)({
      to: "/recipe",
      state: { servings: selectedServings },
      replace: true,
    });
  };

  if (showServingsDialog) {
    return (
      <ServingsDialog
        isOpen={true}
        onClose={() => navigate({ to: "/home" })}
        onConfirm={handleServingsConfirm}
      />
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
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: "16px",
              p: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder="מה תרצה להכין היום?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />

            <Button
              fullWidth
              variant="outlined"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              endIcon={<ChevronDown size={20} />}
              sx={{
                mb: 2,
                justifyContent: "space-between",
                color:
                  selectedPreferences.length > 0
                    ? "primary.main"
                    : "text.secondary",
                borderColor: "grey.300",
                textTransform: "none",
              }}
            >
              <Typography>
                {selectedPreferences.length > 0
                  ? `${selectedPreferences.length} העדפות נבחרו`
                  : "בחר העדפות"}
              </Typography>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: { width: anchorEl?.offsetWidth, maxHeight: 300 },
              }}
            >
              {Object.values(Preferences).map((pref) => (
                <MenuItem key={pref} sx={{ p: 0 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPreferences.includes(pref)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPreferences([
                              ...selectedPreferences,
                              pref,
                            ]);
                          } else {
                            setSelectedPreferences(
                              selectedPreferences.filter((p) => p !== pref)
                            );
                          }
                        }}
                      />
                    }
                    label={pref}
                    sx={{ width: "100%", m: 0, px: 2 }}
                  />
                </MenuItem>
              ))}
            </Menu>

            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerate}
              disabled={generateRecipeMutation.isPending}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                py: 1.5,
                borderRadius: "25px",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
            >
              {generateRecipeMutation.isPending ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography color="white">מייצר מתכון...</Typography>
                </Box>
              ) : (
                <Typography color="white">הכן מתכון</Typography>
              )}
            </Button>
          </Box>
        </Box>

        {generatedRecipes.length > 0 && (
          <Box sx={{ px: 2 }}>
            <ItemList
              itemsCount={generatedRecipes.length}
              title="מתכונים חדשים"
              renderRow={(index) => (
                <RecipeCard
                  recipe={generatedRecipes[index]}
                  onSelect={() => handleRecipeSelect(generatedRecipes[index])}
                  servings={servings || 0}
                />
              )}
              maxHeight="400px"
            />
          </Box>
        )}

        {usedRecipes && usedRecipes.length > 0 && (
          <Box sx={{ px: 2 }}>
            <ItemList
              itemsCount={usedRecipes.length}
              title="מתכונים קודמים"
              renderRow={(index) => (
                <RecipeCard
                  recipe={usedRecipes[index]}
                  onSelect={() => handleRecipeSelect(usedRecipes[index])}
                  servings={servings || 0}
                />
              )}
              maxHeight="400px"
            />
          </Box>
        )}
      </Box>

      <ConfirmFooter
        onBack={handleBack}
        onCancel={() => navigate({ to: "/home" })}
      />

      {showMissingDialog && selectedRecipe !== null && (
        <MissingIngredientsDialog
          isOpen={showMissingDialog}
          onClose={() => setShowMissingDialog(false)}
          recipe={selectedRecipe}
          servings={servings || 0}
          onContinueAnyway={handleContinueAnyway}
        />
      )}
    </div>
  );
};

export default RecipeSelection;
