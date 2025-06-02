import Loader from "@/components/Loader";
import RecipeSwipeView from "@/components/RecipeSwipeView";
import { useRecipe } from "@/hooks/useRecipe";
import { useUser } from "@/hooks/useUser";
import { Preferences } from "@/types";
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "@tanstack/react-form";

const RecipeGenerator = () => {
  const { user } = useUser();
  const { generateRecipe, recipes } = useRecipe();

  const form = useForm({
    defaultValues: {
      sensitivities: user?.sensitivities ?? [],
      preferences: [] as string[],
    },
    onSubmit: async ({ value }) => {
      generateRecipe(value);
    },
  });

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
        <RecipeSwipeView recipes={recipes} />
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
    </div>
  );
};

export default RecipeGenerator;
