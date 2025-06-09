import { FC, useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Box, TextField, Button, Typography, Chip } from "@mui/material";
import { AlertTriangle, LogOut } from "lucide-react";
import { Drawer } from "@/components/Drawer";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUser } from "@/hooks/useUser";

interface Props {
  open: boolean;
  onClose: () => void;
}

type UserSettingsForm = {
  kitchenName: string;
  weight: number;
  height: number;
  goal: string;
  dietaryPreference: string[];
  notes: string;
};

const dietaryOptions = [
  { value: "kosher", label: "כשר" },
  { value: "vegan", label: "טבעוני" },
  { value: "vegetarian", label: "צמחוני" },
  { value: "gluten-free", label: "ללא גלוטן" },
  { value: "keto", label: "קטוגני" },
  { value: "halal", label: "חלאל" },
];

export const UserSettingsDrawer: FC<Props> = ({ open, onClose }) => {
  const {
    userSettings,
    isLoading,
    updateUserSettingsMutation,
    joinKitchenMutation,
    createKitchenMutation,
  } = useUserSettings();
  const { logout } = useUser();

  const form = useForm({
    defaultValues: {
      kitchenName: "",
      weight: 0,
      height: 0,
      goal: "",
      dietaryPreference: [] as string[],
      notes: "",
    },
    onSubmit: async ({ value }: { value: UserSettingsForm }) => {
      updateUserSettingsMutation.mutate(
        {
          ...value,
          dietaryPreference: value.dietaryPreference.join(","), // Convert array to string for backend
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    },
  });

  // Track if form has changes
  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<UserSettingsForm | null>(
    null
  );

  useEffect(() => {
    if (userSettings && open) {
      const preferences = userSettings.dietaryPreference
        ? userSettings.dietaryPreference.split(",").filter(Boolean)
        : [];
      const values = {
        kitchenName: userSettings.kitchenName || "",
        weight: userSettings.weight || 0,
        height: userSettings.height || 0,
        goal: userSettings.goal || "",
        dietaryPreference: preferences,
        notes: userSettings.notes || "",
      };

      form.setFieldValue("kitchenName", values.kitchenName);
      form.setFieldValue("weight", values.weight);
      form.setFieldValue("height", values.height);
      form.setFieldValue("goal", values.goal);
      form.setFieldValue("dietaryPreference", values.dietaryPreference);
      form.setFieldValue("notes", values.notes);

      setOriginalValues(values);
      setHasChanges(false);
    }
  }, [userSettings, open]);

  // Check for changes whenever form values change
  useEffect(() => {
    if (originalValues) {
      const currentValues = {
        kitchenName: form.getFieldValue("kitchenName"),
        weight: form.getFieldValue("weight"),
        height: form.getFieldValue("height"),
        goal: form.getFieldValue("goal"),
        dietaryPreference: form.getFieldValue("dietaryPreference"),
        notes: form.getFieldValue("notes"),
      };

      const changed =
        JSON.stringify(currentValues) !== JSON.stringify(originalValues);
      setHasChanges(changed);
    }
  }, [
    form.getFieldValue("kitchenName"),
    form.getFieldValue("weight"),
    form.getFieldValue("height"),
    form.getFieldValue("goal"),
    form.getFieldValue("dietaryPreference"),
    form.getFieldValue("notes"),
    originalValues,
  ]);

  const handleJoinKitchen = () => {
    const kitchenName = form.getFieldValue("kitchenName");
    if (!kitchenName) return;

    joinKitchenMutation.mutate(kitchenName, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleCreateKitchen = () => {
    const kitchenName = form.getFieldValue("kitchenName");
    if (!kitchenName) return;

    createKitchenMutation.mutate(kitchenName, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const handleDietaryPreferenceChange = (value: string, checked: boolean) => {
    const currentPreferences = form.getFieldValue("dietaryPreference");
    if (checked) {
      form.setFieldValue("dietaryPreference", [...currentPreferences, value]);
    } else {
      form.setFieldValue(
        "dietaryPreference",
        currentPreferences.filter((pref) => pref !== value)
      );
    }
  };

  if (isLoading) {
    return (
      <Drawer open={open} onClose={onClose}>
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>טוען הגדרות...</Typography>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onClose={onClose} height="fit-content">
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: "grey.300",
          borderRadius: 2,
          margin: "0 auto 16px",
        }}
      />

      <Box sx={{ px: 3, pb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            textAlign: "center",
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          הגדרות משתמש
        </Typography>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          {/* Kitchen Section */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.primary",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              מטבח:
            </Typography>

            <form.Field name="kitchenName">
              {(field) => (
                <TextField
                  fullWidth
                  size="small"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  sx={{ mb: 1 }}
                />
              )}
            </form.Field>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                size="small"
                variant="contained"
                onClick={handleJoinKitchen}
                disabled={
                  joinKitchenMutation.isPending ||
                  !form.getFieldValue("kitchenName")
                }
                sx={{
                  py: 0.75,
                  fontSize: "12px",
                }}
              >
                הצטרף למטבח
              </Button>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleCreateKitchen}
                disabled={
                  createKitchenMutation.isPending ||
                  !form.getFieldValue("kitchenName")
                }
                sx={{
                  py: 0.75,
                  fontSize: "12px",
                }}
              >
                צור מטבח
              </Button>
            </Box>
          </Box>

          {/* Physical Info Section */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 1,
                color: "text.primary",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              פרטים משותפים:
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <form.Field name="weight">
                {(field) => (
                  <Box sx={{ position: "relative", flex: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={field.state.value || ""}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value) || 0)
                      }
                      inputProps={{ min: 0, step: 0.1 }}
                      placeholder="משקל"
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "text.secondary",
                        pointerEvents: "none",
                        fontSize: "12px",
                      }}
                    >
                      Kg
                    </Typography>
                  </Box>
                )}
              </form.Field>
              <form.Field name="height">
                {(field) => (
                  <Box sx={{ position: "relative", flex: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={field.state.value || ""}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value) || 0)
                      }
                      inputProps={{ min: 0, step: 1 }}
                      placeholder="גובה"
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "text.secondary",
                        pointerEvents: "none",
                        fontSize: "12px",
                      }}
                    >
                      סמ
                    </Typography>
                  </Box>
                )}
              </form.Field>
            </Box>
          </Box>

          {/* Goals Section */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 1,
                color: "text.primary",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              יעדים תזונתיים:
            </Typography>

            <form.Field name="goal">
              {(field) => (
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="לפני שלושה ימים..."
                />
              )}
            </form.Field>
          </Box>

          {/* Dietary Preferences */}
          <Box sx={{ mb: 2 }}>
            <form.Field name="dietaryPreference">
              {(field) => (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.5,
                  }}
                >
                  {dietaryOptions.map((option) => {
                    const isSelected = field.state.value.includes(option.value);
                    return (
                      <Chip
                        key={option.value}
                        label={option.label}
                        clickable
                        size="small"
                        onClick={() =>
                          handleDietaryPreferenceChange(
                            option.value,
                            !isSelected
                          )
                        }
                        variant={isSelected ? "filled" : "outlined"}
                        sx={{
                          bgcolor: isSelected ? "#E49A61" : "transparent",
                          color: isSelected ? "white" : "text.primary",
                          borderColor: isSelected ? "#E49A61" : "grey.300",
                          "&:hover": {
                            bgcolor: isSelected
                              ? "#E49A61"
                              : "rgba(228, 154, 97, 0.1)",
                            borderColor: "#E49A61",
                          },
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: "14px",
                          height: 28,
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </form.Field>
          </Box>

          {/* Allergies Section */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              sx={{
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "text.primary",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              <AlertTriangle size={16} color="#E49A61" />
              אלרגיות ורגישויות{" "}
            </Typography>

            <form.Field name="notes">
              {(field) => (
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="אלרגיה לאגוזים"
                />
              )}
            </form.Field>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={updateUserSettingsMutation.isPending || !hasChanges}
              sx={{
                py: 1.5,
                px: 2,
                fontSize: "14px",
                fontWeight: 600,
                flex: 1,
                opacity: hasChanges ? 1 : 0.5,
              }}
            >
              שמור הגדרות
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
              endIcon={<LogOut size={16} />}
              sx={{
                py: 1.5,
                px: 2,
                fontSize: "14px",
                fontWeight: 600,
                borderColor: "error.main",
                color: "error.main",
                minWidth: "110px",
                "&:hover": {
                  borderColor: "error.dark",
                  bgcolor: "error.light",
                },
              }}
            >
              <div style={{ marginLeft: ".5rem" }}>התנתק</div>
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};
