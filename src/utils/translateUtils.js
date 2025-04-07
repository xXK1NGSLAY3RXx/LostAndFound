// utils/translateUtils.js

import { GOOGLE_CLOUD_API_KEY } from '../config/translationConfig'; 

// Google’s Translation V2 endpoint:
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

export async function translateText(sourceText, targetLanguage) {
  try {
    const response = await fetch(
      `${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: sourceText,           // text to translate
          target: targetLanguage,  // e.g. 'en', 'es'
          format: 'text',
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      console.error('Translation API error:', data.error);
      return null;
    }

    // The translated text is typically in data.data.translations[0].translatedText
    const translatedText = data?.data?.translations?.[0]?.translatedText;
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}
