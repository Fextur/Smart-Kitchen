import React, { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
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
  const form = useForm({
    defaultValues: {
      kitchenName: "",
      weight: 0,
      height: 0,
      goal: "",
      dietaryPreference: "",
      notes: "",
    },
    onSubmit: async ({ value }: { value: UserSettingsForm }) => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        await axios.put(`/users/${userId}/settings`, value);
        alert("ההגדרות נשמרו בהצלחה!");
      } catch (err) {
        console.error("שגיאה בשמירת ההגדרות", err);
      }
    },
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    axios
      .get(`/users/${userId}/settings`)
      .then((res) => {
        const data = res.data;
        form.setFieldValue("kitchenName", data.kitchenName || "");
        form.setFieldValue("weight", data.weight || 0);
        form.setFieldValue("height", data.height || 0);
        form.setFieldValue("goal", data.goal || "");
        form.setFieldValue("dietaryPreference", data.dietaryPreference || "");
        form.setFieldValue("notes", data.notes || "");
      })
      .catch((err) => console.error("שגיאה בטעינת ההגדרות", err));
  }, []);

  const handleJoinKitchen = () => {
    const userId = localStorage.getItem("userId");
    const kitchenName = form.getFieldValue("kitchenName");
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
    const kitchenName = form.getFieldValue("kitchenName");
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      style={{ padding: 16, direction: "rtl" }}
    >
      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        הגדרות משתמש
      </Typography>

      <Typography sx={{ mb: 1 }}>מטבח:</Typography>
      <form.Field name="kitchenName">
        {(field) => (
          <TextField
            fullWidth
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}
      </form.Field>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleJoinKitchen}
        >
          הצטרף למטבח
        </Button>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          onClick={handleCreateKitchen}
        >
          צור מטבח
        </Button>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <form.Field name="weight">
          {(field) => (
            <TextField
              fullWidth
              label="משקל (ק״ג)"
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          )}
        </form.Field>
        <form.Field name="height">
          {(field) => (
            <TextField
              fullWidth
              label="גובה (ס״מ)"
              type="number"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
            />
          )}
        </form.Field>
      </Box>

      <form.Field name="goal">
        {(field) => (
          <TextField
            fullWidth
            label="יעדים תזונתיים"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}
      </form.Field>

      <Typography sx={{ mb: 1 }}>העדפה תזונתית:</Typography>
      <form.Field name="dietaryPreference">
        {(field) => (
          <RadioGroup
            row
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="kosher" control={<Radio />} label="כשר" />
            <FormControlLabel
              value="vegan"
              control={<Radio />}
              label="טבעוני"
            />
            <FormControlLabel
              value="vegetarian"
              control={<Radio />}
              label="צמחוני"
            />
            <FormControlLabel
              value="celiac"
              control={<Radio />}
              label="צליאקי"
            />
          </RadioGroup>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <TextField
            fullWidth
            label="מגבלות אחרות / הערות תזונתיות"
            multiline
            rows={2}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            sx={{ mb: 3 }}
          />
        )}
      </form.Field>

      <Button fullWidth type="submit" variant="contained" color="primary">
        שמור הגדרות
      </Button>
    </form>
  );
};

export default UserSettings;
