import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateSummary(content: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `You are a helpful assistant that creates concise book summaries. Focus on key plot points, character developments, and major themes. Avoid any spoilers beyond the provided content.

Please provide a summary of the following book content:

${content}`
      }
    ]
  });

  const responseContent = message.content[0];
  if ('text' in responseContent) {
    return responseContent.text;
  }
  return '';
}

export async function generateCharacterInfo(content: string): Promise<{
  name: string;
  description: string;
  firstAppearance: number;
}[]> {
  const message = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `You are a helpful assistant that identifies and describes characters in book content. For each character, provide their name, a brief description, and the position of their first appearance in the text.

Please analyze the following text and identify any characters. Return the information in JSON format with an array of objects containing "name", "description", and "firstAppearance" (word position) fields:

${content}`
      }
    ]
  });

  try {
    const responseContent = message.content[0];
    if (!('text' in responseContent)) {
      return [];
    }

    // Extract JSON from the response
    const jsonMatch = responseContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    const characters = JSON.parse(jsonMatch[0]);
    return Array.isArray(characters) ? characters : characters.characters;
  } catch (error) {
    console.error('Error parsing character information:', error);
    return [];
  }
} 