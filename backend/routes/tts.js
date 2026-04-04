import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const response = await axios({
      method: "POST",
      url: "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb", // George - free default voice
      headers: {
        "xi-api-key": process.env.ELEVEN_API_KEY,
        "Content-Type": "application/json",
      },
      data: {
        text,
        model_id: "eleven_flash_v2_5", // ✅ Current free tier model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      responseType: "arraybuffer",
    });

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'attachment; filename="speech.mp3"',
      "Content-Length": response.data.length,
    });

    res.send(Buffer.from(response.data));

  } catch (err) {
    let errorDetails = err.message;
    if (err.response?.data) {
      try {
        errorDetails = JSON.parse(Buffer.from(err.response.data).toString("utf-8"));
      } catch {
        errorDetails = Buffer.from(err.response.data).toString("utf-8");
      }
    }
    console.error("TTS Error:", errorDetails);
    res.status(500).json({ error: "TTS failed", details: errorDetails });
  }
});

export default router;