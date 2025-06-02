import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { User } from "@/types";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { useUser } from "@/hooks/useUser";

export const useRegister = () => {
  const { setUser } = useUser();

  const registerUser = async (
    email: User["email"],
    name: User["name"],
    userName: User["userName"],
    password: string
  ): Promise<User | null> => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", name);
      formData.append("userName", userName);
      formData.append("password", password);

      const { data } = await api.post(API_ROUTES.users, {
        email,
        name,
        userName,
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

  const registerMutation = useMutation({
    mutationFn: ({
      email,
      name,
      userName,
      password,
    }: {
      email: User["email"];
      name: User["name"];
      userName: User["userName"];
      password: string;
    }) => registerUser(email, name, userName, password),
    onSuccess: (user) => {
      if (user) {
        setUser(user);
      }
    },
  });

  return {
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error
      ? registerMutation.error.message
      : null,
  };
};
