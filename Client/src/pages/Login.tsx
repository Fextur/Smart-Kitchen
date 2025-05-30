import { TextField, Button, Typography } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [isGoogleErrorShown, setIsGoogleErrorShown] = useState(false);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {},
  });

  const handleSuccessLogin = async (credentialResponse: CredentialResponse) => {
    //   loginGoogle(
    //     { credential: credentialResponse.credential },
    //     {
    //       onSuccess: () => navigate({ to: "/" }),
    //     }
    //   );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // height: "100%",
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
          name="username"
          validators={{
            onChange: ({ value }) =>
              !value ? "Username is required" : undefined,
          }}
        >
          {(field) => (
            <TextField
              fullWidth
              label="שם משתמש"
              value={field.state.value}
              autoComplete="off"
              onChange={(e) => field.handleChange(e.target.value)}
              error={!!field.state.meta.errors?.length}
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
              error={!!field.state.meta.errors?.length}
              helperText={field.state.meta.errors?.[0] || ""}
              sx={{ m: 1, direction: "rtl" }}
            />
          )}
        </form.Field>
        <Button
          // loading={isLoggingIn}
          type="submit"
          variant="contained"
          fullWidth
          // disabled={isLoggingIn}
          sx={{ m: 1, mt: 2, background: "#E49A61" }}
        >
          היכנס
        </Button>
        <GoogleLogin
          width={100}
          onSuccess={handleSuccessLogin}
          onError={() => setIsGoogleErrorShown(true)}
        />
        {isGoogleErrorShown && (
          <Typography fontSize={15} color="error">
            Error logging in via Google
          </Typography>
        )}
        <Button fullWidth variant="text" sx={{ m: 1, color: "#E49A61" }}>
          עוד אין לך חשבון קיים? הירשם כאן
        </Button>
      </form>
    </div>
  );
};

export default Login;
