const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require("../models/Task");
const Expense = require("../models/Expense");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getInsights = async (req, res) => {
    try {
        const tasks = await Task.find();
        const expenses = await Expense.find();

        const prompt = `
You are a helpful AI assistant. Here is the user's data:
Tasks: ${JSON.stringify(tasks, null, 2)}
Expenses: ${JSON.stringify(expenses, null, 2)}

Generate a JSON object in the following exact format (NO code blocks, NO markdown, JUST pure JSON):

{
  "summary": "write a 2–3 sentence summary of overall productivity and status.",
  "recommendations": ["suggest up to 3 next tasks or improvements"],
  "spendingInsight": "brief comment about monthly expenses or budgeting."
}
Make sure output is **valid raw JSON only**, with no text before or after.
`;

        // Model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text().trim();

        // 🧩 Fix: Clean up any markdown-like formatting
        const cleanedResponse = aiResponse
            .replace(/```[\s\S]*?```/g, "")
            .trim();

        // 🧠 Try parsing AI response safely
        let insights;
        try {
            insights = JSON.parse(cleanedResponse);
        } catch (err) {
            console.error("AI response not valid JSON, raw text:\n", aiResponse);
            throw new Error("Failed to parse AI response as JSON.");
        }

        res.json({ success: true, aiInsights: insights });
    } catch (err) {
        console.error("AI error:", err);
        res.status(500).json({
            success: false,
            error: "AI analysis failed.",
            message: err.message,
        });
    }
};
