import Groq from "groq-sdk";
import 'dotenv/config';

const groq = new Groq({ apiKey:  process.env.GROQ_API_KEY});

export async function main(message) {
  const chatCompletion = await getGroqChatCompletion(message);
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
  return chatCompletion.choices[0]?.message?.content;
}

export async function getGroqChatCompletion(message) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    model: "openai/gpt-oss-120b",
  });
}
