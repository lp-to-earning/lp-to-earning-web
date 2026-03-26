import { useSyncExternalStore } from "react";
import {
  privateKeyRegistrationSubscribe,
  readPrivateKeyRegisteredSnapshot,
} from "@/lib/private-key-registration";

function getServerSnapshot() {
  return false;
}

export function usePrivateKeyRegistered(): boolean {
  return useSyncExternalStore(
    privateKeyRegistrationSubscribe,
    readPrivateKeyRegisteredSnapshot,
    getServerSnapshot,
  );
}
