import { TextField, Button, Typography } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "@tanstack/react-router";

const Login = () => {
  const [isGoogleErrorShown, setIsGoogleErrorShown] = useState(false);

  const navigate = useNavigate();
  const { login, isLoggingIn, loginError, loginGoogle } = useUser();

  const form = useForm({
    defaultValues: {
      userName: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      login(value, {
        onSuccess: () => navigate({ to: "/" }),
      });
    },
  });

  const handleSuccessLogin = async (credentialResponse: CredentialResponse) => {
    loginGoogle(
      { credential: credentialResponse.credential },
      {
        onSuccess: () => navigate({ to: "/" }),
      }
    );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100vw",
      }}
    >
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "60vw",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field
          name="userName"
          validators={{
            onChange: ({ value }) =>
              !value ? "חובה להזין שם משתמש" : undefined,
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              label="שם משתמש"
              value={field.state.value}
              autoComplete="off"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length || !!loginError}
              helperText={field.state.meta.errors?.[0] || ""}
              sx={{ m: 1, direction: "rtl" }}
            />
          )}
        </form.Field>
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => (!value ? "חובה להזין סיסמה" : undefined),
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              label="סיסמה"
              type="password"
              autoComplete="off"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length || !!loginError}
              helperText={field.state.meta.errors?.[0] || ""}
              sx={{ m: 1, direction: "rtl" }}
            />
          )}
        </form.Field>
        {loginError && (
          <Typography fontSize="0.8rem" color="error">
            שגיאה בהתחברות
          </Typography>
        )}

        <Button
          loading={isLoggingIn}
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoggingIn}
          sx={{ m: 1, mt: 2, background: "#E49A61" }}
        >
          היכנס
        </Button>
        <GoogleLogin
          onSuccess={handleSuccessLogin}
          onError={() => setIsGoogleErrorShown(true)}
        />

        {isGoogleErrorShown && (
          <Typography fontSize={15} color="error">
            שגיאה בהתחברות עם גוגל
          </Typography>
        )}
        <Button
          fullWidth
          variant="text"
          sx={{ m: 1, color: "#E49A61" }}
          onClick={() => navigate({ to: "/register" })}
        >
          עוד אין לך חשבון קיים? הירשם כאן
        </Button>
      </form>
    </div>
  );
};

export default Login;
