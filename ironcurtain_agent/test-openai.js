import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

async function main() {
  const model = createOpenAI({ apiKey: 'ollama', baseURL: 'http://127.0.0.1:11434/v1' })('llama3.1');
  try {
    await generateText({
      model,
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'user', content: 'There' }
      ]
    });
    console.log("Success");
  } catch (err) {
    console.error("Error:", err.message);
  }
}
main();
