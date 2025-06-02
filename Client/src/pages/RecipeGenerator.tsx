import RecipeSwipeView from "@/components/RecipeSwipeView";
import { useRecipe } from "@/hooks/useRecipe";
import { useUser } from "@/hooks/useUser";
import { Preferences } from "@/types";
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  TextField,
} from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const RecipeGenerator = () => {
  const router = useRouter();
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
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
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
          sx={{
            p: 1,
            borderRadius: 1.5,
          }}
          onClick={() => router.history.go(-1)}
        >
          <ArrowRight size={32} />
        </IconButton>
      </Box>
    </div>
  );
};

export default RecipeGenerator;
