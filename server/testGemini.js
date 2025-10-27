const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.AIzaSyDy4OUsyPmD7Kjbiflplu5M9PHaFmpHTmk);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response = await model.generateContent("Say hello from test script");
    console.log(response.response.text());
}
test();
