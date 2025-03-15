import { useEffect, useState } from 'react';
import { Character } from '@/types';

interface CharacterListProps {
  bookId: string;
  currentPosition: number;
  className?: string;
}

export function CharacterList({
  bookId,
  currentPosition,
  className = ''
}: CharacterListProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/books/${bookId}/characters?position=${currentPosition}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch characters');
        }

        const data = await response.json();
        setCharacters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [bookId, currentPosition]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No characters found up to this point in the story.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {characters.map((character) => (
        <div
          key={character.id}
          className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            {character.name}
          </h3>
          {character.description && (
            <p className="mt-2 text-gray-700">{character.description}</p>
          )}
          <div className="mt-2 text-sm text-gray-500">
            First appearance: {Math.round(character.firstAppearance / 100)}% into the story
          </div>
        </div>
      ))}
    </div>
  );
} 