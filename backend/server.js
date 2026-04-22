const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ✅ If Node < 18, uncomment next line
// const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/debug", async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: "code and language are required" });
    }

    const trimmed = code.split("\n").slice(0, 30).join("\n");

    // ✅ Stronger + cleaner prompt
    const prompt = `
Return ONLY valid JSON. No explanation.

Format:
{"bug_type":"syntax|runtime|logic|none","line":number,"issue":"","fix":"","explanation":""}

Find exactly ONE critical bug.

Language: ${language}
Code:
${trimmed}
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // ✅ Stable model
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 200
      })
    });

    const text = await response.text();

    // ✅ Debug log (very useful)
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "Invalid API response format" });
    }

    if (!response.ok) {
      console.error("Groq error:", data);
      return res.status(500).json({
        error: data.error?.message || "Groq API failed"
      });
    }

    const raw = data.choices?.[0]?.message?.content || "";

    // ✅ Extract JSON safely
    const match = raw.match(/\{[\s\S]*\}/);

    if (!match) {
      return res.status(500).json({
        error: "No JSON found in AI response",
        raw: raw.slice(0, 100)
      });
    }

    let result;
    try {
      result = JSON.parse(match[0]);
    } catch (e) {
      console.error("Parse error:", raw);
      return res.status(500).json({
        error: "Invalid AI JSON",
        raw: raw.slice(0, 100)
      });
    }

    // ✅ Ensure fields exist (prevents frontend crash)
    result = {
      bug_type: result.bug_type || "none",
      line: typeof result.line === "number" ? result.line : null,
      issue: result.issue || "No issue detected",
      fix: result.fix || "No fix provided",
      explanation: result.explanation || ""
    };

    res.json(result);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server crashed" });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));