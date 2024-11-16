import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function estimateDuration(title: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: `Given the todo task "${title}", estimate how long it would take to complete.
        Respond with ONLY a duration string (e.g., "15 min", "1 hr", "2.5h hr", "3 days", "1-2 days", "3-6 mon").
        Do not include quotes around the duration string.
        Be concise and realistic based on the task description.`
      }]
    });

    const estimate = message.content[0].text.trim();
    if (!estimate) {
      return '15m'; // Default duration if AI response is empty
    }
    return estimate;
  } catch (error) {
    console.error('Error estimating duration:', error);
    return '15m'; // Default duration on error
  }
} 