import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // -o json 옵션을 사용하여 CLI 출력 결과를 JSON 문자열로 받습니다.
    const { stdout } = await execAsync("byreal-cli pools -o json --non-interactive");
    const parsedData = JSON.parse(stdout);
    
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Failed to execute byreal-cli:", error);
    return NextResponse.json(
      { error: "풀 정보를 가져오는 데 실패했습니다." },
      { status: 500 }
    );
  }
}
