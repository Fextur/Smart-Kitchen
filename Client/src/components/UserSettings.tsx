import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import axios from "axios";

type UserSettingsForm = {
  kitchenName: string;
  weight: number;
  height: number;
  goal: string;
  dietaryPreference: string;
  notes: string;
};

const UserSettings: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
  } = useForm<UserSettingsForm>({
    defaultValues: {
      kitchenName: "",
      weight: 0,
      height: 0,
      goal: "",
      dietaryPreference: "",
      notes: "",
    },
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    axios
      .get(`/users/${userId}/settings`)
      .then((res) => {
        const data = res.data;
        setValue("kitchenName", data.kitchenName || "");
        setValue("weight", data.weight || 0);
        setValue("height", data.height || 0);
        setValue("goal", data.goal || "");
        setValue("dietaryPreference", data.dietaryPreference || "");
        setValue("notes", data.notes || "");
      })
      .catch((err) => console.error("שגיאה בטעינת ההגדרות", err));
  }, [setValue]);

  const onSubmit = (data: UserSettingsForm) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    axios
      .put(`/users/${userId}/settings`, data)
      .then(() => alert("ההגדרות נשמרו בהצלחה!"))
      .catch((err) => console.error("שגיאה בשמירת ההגדרות", err));
  };

  const handleJoinKitchen = () => {
    const userId = localStorage.getItem("userId");
    const kitchenName = getValues("kitchenName");
    if (!userId || !kitchenName) return;

    axios
      .post("/users/join-to-kitchen", { userId, kitchenName })
      .then(() => alert("הצטרפת למטבח בהצלחה!"))
      .catch((err) => {
        console.error("שגיאה בהצטרפות למטבח", err);
        alert("לא הצלחנו להצטרף למטבח. ודא שהשם נכון");
      });
  };

  const handleCreateKitchen = () => {
    const userId = localStorage.getItem("userId");
    const kitchenName = getValues("kitchenName");
    if (!userId || !kitchenName) return;

    axios
      .post("/users/create-kitchen", { userId, name: kitchenName })
      .then(() => alert("מטבח חדש נוצר בהצלחה!"))
      .catch((err) => {
        console.error("שגיאה ביצירת המטבח", err);
        alert("לא הצלחנו ליצור מטבח. נסה שם אחר");
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 16, direction: "rtl" }}>
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        הגדרות משתמש
      </Typography>

      <Typography sx={{ mb: 1 }}>מטבח:</Typography>
      <TextField fullWidth {...register("kitchenName")} sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button fullWidth variant="contained" color="primary" onClick={handleJoinKitchen}>
          הצטרף למטבח
        </Button>
        <Button fullWidth variant="outlined" color="primary" onClick={handleCreateKitchen}>
          צור מטבח
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="משקל (ק״ג)"
          type="number"
          {...register("weight")}
        />
        <TextField
          fullWidth
          label="גובה (ס״מ)"
          type="number"
          {...register("height")}
        />
      </Box>

      <TextField
        fullWidth
        label="יעדים תזונתיים"
        {...register("goal")}
        sx={{ mb: 2 }}
      />

      <Typography sx={{ mb: 1 }}>העדפה תזונתית:</Typography>
      <RadioGroup row {...register("dietaryPreference")} sx={{ mb: 2 }}>
        <FormControlLabel value="kosher" control={<Radio />} label="כשר" />
        <FormControlLabel value="vegan" control={<Radio />} label="טבעוני" />
        <FormControlLabel value="vegetarian" control={<Radio />} label="צמחוני" />
        <FormControlLabel value="celiac" control={<Radio />} label="צליאקי" />
      </RadioGroup>

      <TextField
        fullWidth
        label="מגבלות אחרות / הערות תזונתיות"
        multiline
        rows={2}
        {...register("notes")}
        sx={{ mb: 3 }}
      />

      <Button fullWidth type="submit" variant="contained" color="primary">
        שמור הגדרות
      </Button>
    </form>
  );
};

export default UserSettings;
