import { LayoutDashboard } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Button from "@/components/Button";

interface HeaderProps {
  token: string | null;
  connected: boolean;
  logout: () => void;
}

export default function Header({ token, connected, logout }: HeaderProps) {
  return (
    <header className="glass ghost-border mb-8 flex flex-col items-center justify-between gap-4 rounded-3xl p-6 sm:flex-row">
      <div className="flex items-center gap-3">
        <div className="from-primary-500 to-primary-800 rounded-2xl bg-gradient-to-br p-3 shadow-lg">
          <LayoutDashboard className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="from-primary-500 to-primary-800 bg-gradient-to-r bg-clip-text text-2xl font-black text-transparent">
            lp-to-earning dashboard
          </h1>
          <p className="text-muted-foreground text-xs"></p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <WalletMultiButton className="" />
        {token && connected && (
          <Button onClick={logout} variant="danger">
            로그아웃
          </Button>
        )}
      </div>
    </header>
  );
}
