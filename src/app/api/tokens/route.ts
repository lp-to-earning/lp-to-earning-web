import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync("byreal-cli tokens -o json --non-interactive");
    const parsedData = JSON.parse(stdout);
    
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Failed to execute byreal-cli tokens:", error);
    return NextResponse.json(
      { error: "토큰 정보를 가져오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
