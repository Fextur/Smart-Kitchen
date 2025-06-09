import { atom } from "jotai";
import { User } from "@/types";

export const userAtom = atom<User | null>(null);

export const loadingCountAtom = atom(0);
export const isLoadingAtom = atom((get) => get(loadingCountAtom) > 0);
