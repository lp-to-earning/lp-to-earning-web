export const PRIVATE_KEY_REGISTERED_KEY = "lp_private_key_registered";

const CHANGED = "lp-private-key-registration-changed";

export function notifyPrivateKeyRegistrationChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGED));
}

export function markPrivateKeyRegistered() {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRIVATE_KEY_REGISTERED_KEY, "1");
  notifyPrivateKeyRegistrationChanged();
}

export function clearPrivateKeyRegistered() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PRIVATE_KEY_REGISTERED_KEY);
  notifyPrivateKeyRegistrationChanged();
}

export function readPrivateKeyRegisteredSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRIVATE_KEY_REGISTERED_KEY) === "1";
}

export function privateKeyRegistrationSubscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === PRIVATE_KEY_REGISTERED_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGED, onChange);
  };
}
