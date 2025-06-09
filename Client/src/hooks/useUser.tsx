import { useMutation } from "@tanstack/react-query";
import { CredentialResponse } from "@react-oauth/google";
import { AxiosError } from "axios";
import { User, UserRes } from "@/types";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { useAtom } from "jotai";
import { userAtom } from "@/atoms/atoms";
import { useKitchen } from "./useKitchen";

export const useUser = () => {
  const [user, setUser] = useAtom(userAtom);
  const { setKitchen } = useKitchen();

  const login = async (userName: User["userName"], password: string) => {
    try {
      const { data } = await api.post<UserRes>(`${API_ROUTES.users}/login`, {
        userName,
        password,
      });

      localStorage.setItem("accessToken", data.accessToken);

      return data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const { message } = error.response.data;
        console.error("Error creating user:", message);
        throw new Error(message);
      }
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const loginByToken = async (token: string) => {
    try {
      const { data } = await api.post(`${API_ROUTES.users}/validate-token`, {
        accessToken: token,
      });

      return data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const { message } = error.response.data;
        console.error("Error creating user:", message);
        throw new Error(message);
      }
      console.error("Error creating user:", error);
      throw error;
    }
  };

  const googleLogin = async (credential: CredentialResponse["credential"]) => {
    try {
      const { data } = await api.post(`${API_ROUTES.auth}/googleLogin`, {
        credential,
      });

      // Save the token to localStorage - this was missing!
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      return data;
    } catch (error) {
      console.error("Invalid credentials ", error);
      throw error;
    }
  };
  const loginMutation = useMutation({
    mutationFn: ({
      userName,
      password,
    }: {
      userName: User["userName"];
      password: string;
    }) => login(userName, password),
    onSuccess: (user) => {
      if (user) {
        const { inventory, accessToken, ...userWithoutInventory } = user;

        setUser(userWithoutInventory);
        setKitchen(inventory);
      }
    },
  });

  const loginByTokenMutation = useMutation({
    mutationFn: (token: string) => loginByToken(token),
    onSuccess: (user) => {
      if (user) {
        const { inventory, accessToken, ...userWithoutInventory } = user;

        setUser(userWithoutInventory);
        setKitchen(inventory);
      }
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: ({
      credential,
    }: {
      credential: CredentialResponse["credential"];
    }) => googleLogin(credential),
    onSuccess: (user) => {
      if (user) {
        const { inventory, accessToken, ...userWithoutInventory } = user;
        setUser(userWithoutInventory);
        setKitchen(inventory);
      }
    },
  });

  const logout = async () => {
    try {
      await api.post<User>(`${API_ROUTES.users}/logoutUser`);
      localStorage.removeItem("accessToken");
      setUser(null);
    } catch (error) {
      console.error("Error in logout", error);
      throw error;
    }
  };

  return {
    user,
    setUser,
    loginGoogle: googleLoginMutation.mutate,
    login: loginMutation.mutate,
    loginByToken: loginByTokenMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? loginMutation.error.message : null,
  };
};
