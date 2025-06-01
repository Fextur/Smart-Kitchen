import { isLoadingAtom, loadingCountAtom } from "@/atoms";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";

export const useLoading = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isManualLoading = useAtomValue(isLoadingAtom);
  const setLoading = useSetAtom(loadingCountAtom);
  return {
    isLoading: isFetching > 0 || isMutating > 0 || isManualLoading,
    setLoading: () => setLoading((prev) => prev + 1),
    unsetLoading: () => setLoading((prev) => Math.max(prev - 1, 0)),
  };
};
