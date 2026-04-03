import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const { destination, startDate, endDate, memberCount, budgetMin, budgetMax } =
      await req.json();

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const budgetContext =
      budgetMin && budgetMax
        ? `Budget: ₹${budgetMin.toLocaleString("en-IN")} to ₹${budgetMax.toLocaleString("en-IN")} per person for the entire trip.`
        : "No specific budget set.";

    const prompt = `You are a travel planning assistant. Create a day-by-day itinerary for a group trip.

Destination: ${destination}
Duration: ${days} days (${startDate} to ${endDate})
Group size: ${memberCount} people
${budgetContext}

Create a practical, fun itinerary. For each day include:
- A title for the day
- 2-4 activities with time slots and brief descriptions

Respond ONLY with valid JSON in this exact format, no markdown:
{
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {"time": "9:00 AM", "activity": "Activity name", "description": "Brief description"},
        {"time": "12:00 PM", "activity": "Activity name", "description": "Brief description"}
      ]
    }
  ]
}`;

    // Try gemini-2.5-flash first, fall back to gemini-1.5-flash
    const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let lastError: unknown = null;

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          lastError = new Error("Failed to parse AI response");
          continue;
        }

        const itinerary = JSON.parse(jsonMatch[0]);
        return NextResponse.json(itinerary);
      } catch (e) {
        lastError = e;
        console.error(`Model ${modelName} failed:`, e);
        continue;
      }
    }

    // If all models failed, return helpful error
    const errorMessage =
      lastError instanceof Error && lastError.message.includes("429")
        ? "AI rate limit reached. Please wait a minute and try again."
        : "Failed to generate itinerary. Please try again.";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } catch (error) {
    console.error("AI itinerary error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}
