import { useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { TextField, Button, Typography } from "@mui/material";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useRegister } from "@/hooks/useRegister";
import type { RootSearchParams } from "@/routes";

const Register = () => {
  const [userNameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const { register, isRegistering, registerError } = useRegister();
  const navigate = useNavigate();
  const search = useSearch({ from: "__root__" }) as RootSearchParams;

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      userName: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      register(value, {
        onSuccess: () => {
          // Preserve search params when navigating after successful registration
          navigate({
            to: "/",
            search: search, // Keep join_kitchen param
            replace: true,
          });
        },
        onError: (error: any) => {
          if (error.message.includes("Username is already taken")) {
            setUsernameError("השם משתמש הזה תפוס כבר");
          } else if (error.message.includes("Email is already in use")) {
            setEmailError("המייל הזה תפוס כבר");
          }
        },
      });
    },
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: 20,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          m: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          direction: "rtl",
          color: "black",
        }}
      >
        <UserPlus size={24} />
        הרשמה
      </Typography>
      <form
        style={{ width: "80%" }}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              setEmailError("");
              return !value
                ? "שדה חובה"
                : !/^\S+@\S+\.\S+$/.test(value)
                ? "מייל לא תקין"
                : undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              autoComplete="off"
              label="מייל"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length || !!emailError}
              helperText={field.state.meta.errors?.[0] || emailError || ""}
              sx={{ mt: 2, direction: "rtl" }}
            />
          )}
        </form.Field>

        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              setUsernameError("");
              return !value ? "שדה חובה" : undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              autoComplete="off"
              label="שם פרטי"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length || !!userNameError}
              helperText={field.state.meta.errors?.[0] || userNameError || ""}
              sx={{ mt: 2 }}
            />
          )}
        </form.Field>

        <form.Field
          name="userName"
          validators={{
            onChange: ({ value }) => {
              setUsernameError("");
              return !value ? "שדה חובה" : undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              autoComplete="off"
              label="שם משתמש"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length || !!userNameError}
              helperText={field.state.meta.errors?.[0] || userNameError || ""}
              sx={{ mt: 2 }}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => (!value ? "שדה חובה" : undefined),
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              autoComplete="off"
              label="סיסמה"
              type="password"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length}
              helperText={field.state.meta.errors?.[0] || ""}
              sx={{ mt: 2 }}
            />
          )}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChange: ({ value }) => {
              const passwordValue = form.getFieldValue("password");
              return !value
                ? "שדה חובה"
                : value !== passwordValue
                ? "לא דומה לסיסמה"
                : undefined;
            },
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              autoComplete="off"
              label="הזן סיסמה שנית"
              type="password"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length}
              helperText={field.state.meta.errors?.[0] || ""}
              sx={{ mt: 2 }}
            />
          )}
        </form.Field>

        {registerError && (
          <Typography color="error">
            שגיאה בהרשמה. נסה שנית מאוחר יותר
          </Typography>
        )}

        <Button
          loading={isRegistering}
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 4, background: "#E49A61" }}
          disabled={isRegistering}
        >
          הירשם
        </Button>
      </form>
    </div>
  );
};

export default Register;
