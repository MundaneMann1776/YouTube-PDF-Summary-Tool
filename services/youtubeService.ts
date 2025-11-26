
interface ValidationResult {
  isValid: boolean;
  title?: string;
  error?: string;
}

/**
 * Checks if a YouTube video exists and is public using a third-party oEmbed service.
 * @param url The YouTube URL to validate.
 * @returns A promise that resolves to an object indicating if the video is valid and its title.
 */
export const validateVideoExists = async (url: string): Promise<ValidationResult> => {
  try {
    // Using noembed.com as a proxy to check for video existence without requiring a YouTube API key.
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { isValid: false, error: 'Video not found. Please check the URL.' };
      }
      return { isValid: false, error: `Validation service failed (HTTP ${response.status}). Please try again later.` };
    }

    const data = await response.json();

    // noembed returns an 'error' key for videos that don't exist or are private.
    if (data.error) {
      return { isValid: false, error: 'Video not found. It may be private, unlisted, or the URL is incorrect.' };
    }

    // A valid video will have a title.
    if (!data.title) {
      // Fallback: If title is missing but no error, assume it might be valid but metadata is missing.
      return { isValid: true, title: url };
    }

    return { isValid: true, title: data.title };

  } catch (error) {
    console.warn("Error validating YouTube URL, proceeding with fallback:", error);
    // Fallback: If the validation service fails (e.g. rate limit, downtime), 
    // we allow the user to proceed rather than blocking them. 
    // Gemini might still be able to access it.
    return { isValid: true, title: url };
  }
};