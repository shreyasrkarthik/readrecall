import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';
import { generateCharacterInfo } from '@/lib/claude';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Function to extract characters using Hugging Face
async function getHuggingFaceCharacters(content: string): Promise<any[]> {
  try {
    // Check if we have an API key
    if (!process.env.HUGGING_FACE_API_KEY) {
      console.log('No Hugging Face API key found, falling back to alternative model');
      throw new Error('No Hugging Face API key');
    }

    console.log('Attempting to extract characters from Hugging Face API...');
    
    // Create a manual timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    try {
      // Using a named entity recognition model to identify character names
      const response = await fetch('https://api-inference.huggingface.co/models/dslim/bert-base-NER', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: content.substring(0, 1024), // Limit input size
        }),
        signal: controller.signal,
      });
      
      // Clear the timeout since the request completed
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`Hugging Face API error (${response.status}): ${errorText}`);
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!Array.isArray(result)) {
        console.error('Invalid response format from Hugging Face:', result);
        throw new Error('Invalid response format from Hugging Face');
      }
      
      // Process entities to extract character names (entities with PER tag)
      const characterEntities = result.filter((entity: any) => 
        entity.entity_group === 'PER' || entity.entity_group === 'I-PER' || entity.entity_group === 'B-PER'
      );
      
      // Group similar entities and create character objects
      const characterMap = new Map();
      
      characterEntities.forEach((entity: any) => {
        const name = entity.word.replace(/^##/, '');
        if (!characterMap.has(name)) {
          characterMap.set(name, {
            name: name,
            description: `Character mentioned in the book.`
          });
        }
      });
      
      // Get unique characters
      const characters = Array.from(characterMap.values());
      
      // Only return the top 5 most frequently mentioned characters
      const topCharacters = characters.slice(0, 5);
      
      console.log(`Successfully identified ${topCharacters.length} characters with Hugging Face`);
      return topCharacters;
    } catch (fetchError) {
      // Make sure to clear the timeout if there's an error
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error using Hugging Face API for character extraction:', error);
    
    // Check if we can use Claude
    if (typeof generateCharacterInfo === 'function' && process.env.ANTHROPIC_API_KEY) {
      console.log('Falling back to Claude API for character extraction');
      try {
        const characters = await generateCharacterInfo(content);
        return characters;
      } catch (claudeError) {
        console.error('Claude API fallback also failed:', claudeError);
        // Fall through to OpenAI if Claude fails
      }
    }
    
    // Default fallback to OpenAI
    console.log('Falling back to OpenAI API for character extraction');
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that identifies key characters in book content and provides brief descriptions. Return the data as a JSON array of objects with "name" and "description" fields.'
          },
          {
            role: 'user',
            content: `Identify the main characters in the following book content and provide a brief description of each character. Return your answer as a JSON array of objects with "name" and "description" fields:\n\n${content.substring(0, 4000)}...`
          }
        ],
        max_tokens: 500,
        response_format: { type: "json_object" }
      });
      
      try {
        // Parse the JSON string from OpenAI's response
        const jsonResponse = JSON.parse(response.choices[0].message.content || '{"characters":[]}');
        return Array.isArray(jsonResponse.characters) ? jsonResponse.characters : [];
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', parseError);
        return [];
      }
    } catch (openaiError) {
      console.error('OpenAI fallback also failed:', openaiError);
      // If all APIs fail, return default characters
      return [
        { name: "Main Character", description: "The protagonist of the story." },
        { name: "Supporting Character", description: "A key supporting character in the narrative." }
      ];
    }
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const positionParam = searchParams.get('position') || '0';
    const position = parseInt(positionParam);
    const modelParam = searchParams.get('model') || 'huggingface'; // Default to huggingface

    console.log(`Fetching characters for book ${params.id} at position ${position} using ${modelParam} model`);
    
    // First, check if we already have characters for this position
    const existingCharacters = await prisma.character.findMany({
      where: {
        bookId: params.id,
        firstAppearance: {
          lte: position
        }
      },
      orderBy: {
        firstAppearance: 'asc'
      }
    }).catch(err => {
      console.error('Error querying database for existing characters:', err);
      return [];
    });

    if (existingCharacters.length > 0) {
      console.log(`Found ${existingCharacters.length} existing characters up to position ${position}`);
      return NextResponse.json(existingCharacters);
    }

    // If no characters exist, get the book content up to the position
    const sections = await prisma.bookSection.findMany({
      where: {
        bookId: params.id,
        endPosition: {
          lte: position
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    }).catch(err => {
      console.error('Error querying database for book sections:', err);
      return [];
    });

    if (sections.length === 0) {
      console.log('No content found up to this position');
      return NextResponse.json([
        { name: "Unknown", description: "No characters could be identified at your current reading position." }
      ]);
    }

    console.log(`Found ${sections.length} sections to analyze for characters`);
    
    // Combine the content from all sections
    const content = sections.map(s => s.content).join('\n\n');

    // Extract characters using the selected model
    let characters: any[] = [];
    try {
      if (modelParam === 'huggingface') {
        characters = await getHuggingFaceCharacters(content);
      } else if (modelParam === 'claude' && typeof generateCharacterInfo === 'function') {
        characters = await generateCharacterInfo(content);
      } else {
        // Default to OpenAI
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that identifies key characters in book content and provides brief descriptions. Return the data as a JSON array of objects with "name" and "description" fields.'
            },
            {
              role: 'user',
              content: `Identify the main characters in the following book content and provide a brief description of each character. Return your answer as a JSON array of objects with "name" and "description" fields:\n\n${content.substring(0, 4000)}...`
            }
          ],
          max_tokens: 500,
          response_format: { type: "json_object" }
        });
        
        try {
          // Parse the JSON string from OpenAI's response
          const jsonResponse = JSON.parse(response.choices[0].message.content || '{"characters":[]}');
          characters = Array.isArray(jsonResponse.characters) ? jsonResponse.characters : [];
        } catch (parseError) {
          console.error('Failed to parse OpenAI response as JSON:', parseError);
          characters = [];
        }
      }
    } catch (extractionError) {
      console.error('All character extraction methods failed:', extractionError);
      characters = [
        { name: "Error", description: "Character extraction failed. Please try again later." }
      ];
    }

    // Only store successful character extractions in the database
    if (characters.length > 0 && !characters.some(c => c.name === "Error")) {
      try {
        // Store the characters in the database
        const createdCharacters = await Promise.all(
          characters.map(character => 
            prisma.character.create({
              data: {
                bookId: params.id,
                name: character.name,
                description: character.description,
                firstAppearance: position
              }
            })
          )
        );
        
        console.log(`Successfully created and stored ${createdCharacters.length} new characters`);
        return NextResponse.json(createdCharacters);
      } catch (dbError) {
        console.error('Error storing characters in database:', dbError);
        // Return the characters even if we couldn't store them
        return NextResponse.json(characters);
      }
    } else {
      // Return the characters without storing them
      return NextResponse.json(characters);
    }
  } catch (error) {
    console.error('Error in characters API route:', error);
    // Return a friendly error that can be displayed to the user
    return NextResponse.json([
      { name: "Error", description: "We encountered an error identifying characters. Please try again later." }
    ]);
  }
} 