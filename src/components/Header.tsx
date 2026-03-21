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
    <header className="flex flex-col sm:flex-row justify-between items-center glass ghost-border p-6 rounded-3xl mb-8 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-800 rounded-2xl shadow-lg">
          <LayoutDashboard className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-primary-500 to-primary-800 bg-clip-text text-transparent">
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
