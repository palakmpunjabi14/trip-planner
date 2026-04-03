import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

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

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const itinerary = JSON.parse(jsonMatch[0]);
    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("AI itinerary error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}
