import Loader from "@/components/Loader";
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
import { useState } from "react";

const RecipeGenerator = () => {
  const { user } = useUser();
  const { generateRecipe, recipe, isGenerating } = useRecipe();
  const [formValue, setFormValue] = useState<any>(null);

  const form = useForm({
    defaultValues: {
      sensitivities: ["רגישות לגלוטן", "טבעוני"], //user?.sensitivities,
      preferences: [] as string[],
    },
    onSubmit: async ({ value }) => {
      generateRecipe(value);
      setFormValue(value);
    },
  });

  if (isGenerating) {
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
            מכין מתכון
          </Typography>
          <Loader isLoading={isGenerating} />
        </Box>
      </Box>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {recipe ? (
        <div
          style={{ display: "flex", flexDirection: "column", padding: "15px" }}
        >
          <Typography variant="h2" sx={{ mb: 1 }}>
            :המתכון שלך
          </Typography>
          <Typography sx={{ fontSize: "1.2rem", mb: 2 }}>{recipe}</Typography>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Button variant="contained">הוסף לרשימת קניות</Button>
            <Button
              variant="contained"
              onClick={() => generateRecipe(formValue)}
            >
              תכין לי מתכון חדש
            </Button>
          </div>
        </div>
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
