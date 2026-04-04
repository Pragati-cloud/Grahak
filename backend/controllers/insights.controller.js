import { GoogleGenAI } from "@google/genai";
import Order from "../models/Order.js";

export const getInsights = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const vendorName = req.vendor.businessName || "Your Shop";

    // 1. Revenue per Day
    const revenueData = await Order.aggregate([
      { $match: { vendorId: vendorId } },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 2. Best/Worst Selling Items
    const productPopularity = await Order.aggregate([
      { $match: { vendorId: vendorId } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalQuantitySold: -1 } }
    ]);

    // 3. Rush Times (Order Frequency by Hour)
    const hourlyTraffic = await Order.aggregate([
      { $match: { vendorId: vendorId } },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const aggregatedData = {
      revenueData,
      productPopularity,
      hourlyTraffic
    };

    // If there is no data at all, return gracefully
    if (revenueData.length === 0) {
      return res.json({
        aggregatedData,
        strategicInsights: "No order data available yet to generate insights."
      });
    }

    // Prepare prompt
    const prompt = `System Persona: You are a Senior Business Analyst for a restaurant using the QRDine platform.

Context: I am providing you with aggregated sales data for the shop "${vendorName}".

Revenue Data: ${JSON.stringify(revenueData)}

Product Popularity: ${JSON.stringify(productPopularity)}

Order Frequency by Hour: ${JSON.stringify(hourlyTraffic)}

Instructions:
Trend Analysis: Identify the daily and monthly revenue trends. Is the business growing?
Menu Optimization: Name the top 2 "Hero" items and the 2 "Slow" items. Suggest a pricing or promotion strategy for the slow items.
Operational Peak: Identify the specific "Rush Hour." Recommend how many staff members should be active during this window.

Format: Provide the response in clear bullet points with a concluding "Executive Summary" paragraph.`;

    let strategicInsights = "";
    
    if (!process.env.GEMINI_API_KEY) {
       strategicInsights = "Gemini API key is not configured. Please add GEMINI_API_KEY to your backend .env file to view AI-generated insights.";
    } else {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: prompt,
            });
            strategicInsights = response.text;
        } catch (aiError) {
            console.error("Gemini API Error:", aiError);
            strategicInsights = "Failed to generate AI insights due to an error connecting to the Gemini service.";
        }
    }

    res.json({
      aggregatedData,
      strategicInsights
    });

  } catch (error) {
    console.error("Error generating insights:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
};
