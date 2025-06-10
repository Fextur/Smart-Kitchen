import { FC, useEffect, useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import { AlertTriangle, LogOut, Share2 } from "lucide-react";
import { Drawer } from "@/components/Drawer";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useUser } from "@/hooks/useUser";
import { useDietaryOptions } from "@/hooks/useDietaryOptions";
import { CreateKitchenDialog } from "@/layouts/UserSettingsDrawer/CreateKitchenDialog";
import { JoinKitchenDialog } from "@/layouts/UserSettingsDrawer/JoinKitchenDialog";
import { ShareKitchenDialog } from "@/layouts/UserSettingsDrawer/ShareKitchenDialog";

interface Props {
  open: boolean;
  onClose: () => void;
}

type UserSettingsForm = {
  weight: number;
  height: number;
  goal: string;
  dietaryPreference: string[];
  notes: string;
};

export const UserSettingsDrawer: FC<Props> = ({ open, onClose }) => {
  const {
    userSettings,
    isLoading,
    updateUserSettingsMutation,
    createKitchenMutation,
    joinKitchenMutation,
    getKitchenHashQuery,
  } = useUserSettings();
  const { logout } = useUser();
  const dietaryOptions = useDietaryOptions();

  const [showCreateKitchenDialog, setShowCreateKitchenDialog] = useState(false);
  const [showJoinKitchenDialog, setShowJoinKitchenDialog] = useState(false);
  const [showShareKitchenDialog, setShowShareKitchenDialog] = useState(false);
  const [joinKitchenError, setJoinKitchenError] = useState<string | null>(null);

  const [hasChanges, setHasChanges] = useState(false);
  const [originalValues, setOriginalValues] = useState<UserSettingsForm | null>(
    null
  );

  const form = useForm({
    defaultValues: {
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
          dietaryPreference: value.dietaryPreference.join(","),
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    },
  });

  const areValuesEqual = (
    a: UserSettingsForm,
    b: UserSettingsForm
  ): boolean => {
    if (!a || !b) return false;

    return (
      a.weight === b.weight &&
      a.height === b.height &&
      a.goal === b.goal &&
      a.notes === b.notes &&
      a.dietaryPreference.length === b.dietaryPreference.length &&
      a.dietaryPreference.every(
        (pref, index) => pref === b.dietaryPreference[index]
      )
    );
  };

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      if (originalValues) {
        const currentValues = form.store.state.values;
        const changed = !areValuesEqual(currentValues, originalValues);
        setHasChanges(changed);
      }
    });

    return unsubscribe;
  }, [originalValues, form.store]);

  useEffect(() => {
    if (userSettings && open) {
      const preferences = userSettings.dietaryPreference
        ? userSettings.dietaryPreference.split(",").filter(Boolean)
        : [];
      const values = {
        weight: userSettings.weight || 0,
        height: userSettings.height || 0,
        goal: userSettings.goal || "",
        dietaryPreference: preferences,
        notes: userSettings.notes || "",
      };

      form.setFieldValue("weight", values.weight);
      form.setFieldValue("height", values.height);
      form.setFieldValue("goal", values.goal);
      form.setFieldValue("dietaryPreference", values.dietaryPreference);
      form.setFieldValue("notes", values.notes);

      setOriginalValues(values);
      setHasChanges(false);
    }
  }, [userSettings, open]);

  const handleCreateKitchen = (kitchenName: string) => {
    createKitchenMutation.mutate(kitchenName, {
      onSuccess: () => {
        setShowCreateKitchenDialog(false);
      },
      onError: (error) => {
        console.error("Create kitchen error:", error);
      },
    });
  };

  const handleJoinKitchen = (kitchenHash: string) => {
    setJoinKitchenError(null);
    joinKitchenMutation.mutate(kitchenHash, {
      onSuccess: (data) => {
        if (data.success) {
          setShowJoinKitchenDialog(false);
        } else {
          setJoinKitchenError(data.message);
        }
      },
      onError: (error) => {
        setJoinKitchenError(error.message);
      },
    });
  };

  const handleShareKitchen = async () => {
    try {
      await getKitchenHashQuery.refetch();
      setShowShareKitchenDialog(true);
    } catch (error) {
      console.error("Failed to get kitchen hash for sharing:", error);
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  const handleDietaryPreferenceChange = (value: string, checked: boolean) => {
    const currentPreferences = form.getFieldValue("dietaryPreference") || [];
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
    <>
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
              המטבח שלי:
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "grey.50",
                borderRadius: 1,
                p: 1.5,
                mb: 1,
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                {userSettings?.kitchenName || "מטבח ללא שם"}
              </Typography>
              <IconButton
                size="small"
                onClick={handleShareKitchen}
                sx={{
                  color: "#E49A61",
                  "&:hover": {
                    bgcolor: "rgba(228, 154, 97, 0.1)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    transform: "translateY(-1px)",
                    transition: "all 0.2s ease",
                  },
                }}
              >
                <Share2 size={16} />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                size="small"
                variant="contained"
                onClick={() => setShowCreateKitchenDialog(true)}
                disabled={createKitchenMutation.isPending}
                sx={{
                  py: 0.75,
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "#E49A61",
                }}
              >
                צור מטבח
              </Button>
              <Button
                fullWidth
                size="small"
                variant="contained"
                onClick={() => setShowJoinKitchenDialog(true)}
                disabled={joinKitchenMutation.isPending}
                sx={{
                  py: 0.75,
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "#E49A61",
                }}
              >
                הצטרף למטבח
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
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
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            step: 0.1,
                          },
                        }}
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
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            step: 1,
                          },
                        }}
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
                      const isSelected = field.state.value.includes(
                        option.value
                      );
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
                    color: "white",
                  },
                }}
              >
                <div style={{ marginLeft: ".5rem" }}>התנתק</div>
              </Button>
            </Box>
          </form>
        </Box>
      </Drawer>

      <CreateKitchenDialog
        isOpen={showCreateKitchenDialog}
        onClose={() => setShowCreateKitchenDialog(false)}
        onConfirm={handleCreateKitchen}
        isLoading={createKitchenMutation.isPending}
      />

      <JoinKitchenDialog
        isOpen={showJoinKitchenDialog}
        onClose={() => {
          setShowJoinKitchenDialog(false);
          setJoinKitchenError(null);
        }}
        onConfirm={handleJoinKitchen}
        isLoading={joinKitchenMutation.isPending}
        error={joinKitchenError}
      />

      <ShareKitchenDialog
        isOpen={showShareKitchenDialog}
        onClose={() => setShowShareKitchenDialog(false)}
        kitchenHash={getKitchenHashQuery.data?.kitchenHash || ""}
        kitchenName={
          getKitchenHashQuery.data?.kitchenName ||
          userSettings?.kitchenName ||
          ""
        }
        isLoading={getKitchenHashQuery.isFetching}
      />
    </>
  );
};
