import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConfig, updateConfig } from "@/api/config/config";

export const configKeys = {
  all: ["config"] as const,
  detail: (token: string) => [...configKeys.all, token] as const,
};

export const useConfig = (token: string | null, connected: boolean) => {
  return useQuery({
    queryKey: configKeys.detail(token || ""),
    queryFn: () => getConfig(token!),
    enabled: !!token && connected,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, config }: { token: string; config: Config }) =>
      updateConfig({ token, config }),
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: configKeys.detail(token) });
    },
  });
};
