<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Hot wallet / DB shape (this repo)

If you need the **User / UserConfig fields** for the managed hot wallet flow (`isManaged`, `hotWalletAddress`, encryption fields, withdraw target `walletAddress`, etc.), read **`.plan/hot_wallet_db_spec.md`** before inferring schema from the frontend alone.
