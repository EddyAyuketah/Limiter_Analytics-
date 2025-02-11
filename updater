import type { ToolData } from "@/types/tool"
import { generateMockData } from "./mockData"

export async function fetchToolData(): Promise<{ data: ToolData[]; isMockData: boolean; error: string | null }> {
  try {
    const response = await fetch("/api/fetchToolData")
    if (!response.ok) {
      throw new Error("Failed to fetch data from API")
    }
    const data = await response.json()
    return {
      data: data.map((item: any) => ({
        ...item,
        limitations: JSON.parse(item.limitations),
      })),
      isMockData: false,
      error: null,
    }
  } catch (error) {
    console.warn("Failed to fetch real data, falling back to mock data")
    let errorMessage = "Unknown error occurred"
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      errorMessage = `Failed to fetch real data: ${error.message}`
    } else {
      console.error("Unknown error occurred:", error)
    }
    return { data: generateMockData(), isMockData: true, error: errorMessage }
  }
}

