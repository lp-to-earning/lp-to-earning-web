import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConfig, updateConfig } from "@/api/config/config";

export const configKeys = {
  all: ["config"] as const,
};

export const useConfig = (token: string | null, connected: boolean) => {
  return useQuery({
    queryKey: configKeys.all,
    queryFn: getConfig,
    enabled: !!token && connected,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Config) => updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all });
    },
  });
};
