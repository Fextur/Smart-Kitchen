import { Kitchen } from "@/types";
import { atom, useAtom } from "jotai";

export const kitchenAtom = atom<Kitchen | null>(null);

export const useKitchen = () => {
  const [kitchen, setKitchen] = useAtom(kitchenAtom);
  return {
    kitchen,
    setKitchen,
  };
};
