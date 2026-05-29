'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ITask, GeminiInsight } from '@/types';

export async function generateDashboardInsight(recentTasks: ITask[]): Promise<GeminiInsight | null> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set');
      return null;
    }

    if (!recentTasks || recentTasks.length === 0) {
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a professional work coach writing a positive progress report for an intern at Majesto Limited. 
Given these recent tasks: ${JSON.stringify(recentTasks.map(t => ({ date: t.date, tasks: t.tasks })))}, 
write: 
1) A 2-3 sentence positive summary highlighting growth and achievements (field: summary)
2) A motivational one-liner about current focus (field: currentFocus)
3) A recommended insight from the data to show (field: insight)

Always be encouraging. Never show negative trends. 
Return ONLY a valid JSON object matching this structure:
{
  "summary": "string",
  "currentFocus": "string",
  "insight": "string"
}
Do not include markdown blocks like \`\`\`json or \`\`\`, just the raw JSON object.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean up potential markdown from the response
    if (text.startsWith('```json')) text = text.substring(7);
    if (text.startsWith('```')) text = text.substring(3);
    if (text.endsWith('```')) text = text.substring(0, text.length - 3);

    const parsed = JSON.parse(text) as GeminiInsight;
    return parsed;
  } catch (error) {
    console.error('Error generating AI insight:', error);
    return null;
  }
}
