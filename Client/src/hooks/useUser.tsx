import { useMutation } from "@tanstack/react-query";
import { CredentialResponse } from "@react-oauth/google";
import { AxiosError } from "axios";
import { User } from "../types";
import api from "../axios/axios";
import { API_ROUTES } from "../axios/apiRoutes";
import { atom, useAtom } from "jotai";

export const DEFAULT_USER_IMAGE =
  "https://static.vecteezy.com/system/resources/thumbnails/001/840/618/small/picture-profile-icon-male-icon-human-or-people-sign-and-symbol-free-vector.jpg";

export const userAtom = atom<User | null>(null);

export const useUser = () => {
  const [user, setUser] = useAtom(userAtom);

  const login = async (username: User["username"], password: string) => {
    try {
      const { data } = await api.post<User>(`${API_ROUTES.users}/login`, {
        username,
        password,
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

      return data;
    } catch (error) {
      console.error("Invalid credentials ", error);
      throw error;
    }
  };

  const loginMutation = useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: User["username"];
      password: string;
    }) => login(username, password),
    onSuccess: (user) => {
      if (user) {
        console.log(user);
        setUser(user);
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
        setUser(user);
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
    loginGoogle: googleLoginMutation.mutate,
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ? loginMutation.error.message : null,
  };
};
