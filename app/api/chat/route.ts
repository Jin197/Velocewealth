import { NextResponse } from 'next/server';
import { searchKnowledgeBase, SYSTEM_PROMPT } from '@/lib/knowledge-base';

// Simulated delay to mimic AI thinking
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1].content;
    const apiKey = process.env.OPENAI_API_KEY;

    // Si on a une clé API OpenAI, on fait l'appel réel (à adapter selon le SDK utilisé si on installe @ai-sdk)
    if (apiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages,
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI API Error');
      }

      const data = await response.json();
      return NextResponse.json({
        role: 'assistant',
        content: data.choices[0].message.content,
      });
    }

    // FALLBACK SIMULÉ : Recherche locale dans la Knowledge Base
    await delay(1000); // 1s delay
    const fallbackAnswer = searchKnowledgeBase(lastMessage);

    return NextResponse.json({
      role: 'assistant',
      content: fallbackAnswer,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
