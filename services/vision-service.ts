import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the API key from environment variables
const VISION_API_KEY = Constants.expoConfig?.extra?.googleCloudVisionApiKey;

if (!VISION_API_KEY) {
  console.error('Google Cloud Vision API key is not configured. Please check your environment variables.');
}

interface FrameCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const detectPrice = async (base64Image: string, frame: FrameCoordinates): Promise<number | null> => {
  try {
    console.log('Starting price detection...');
    const apiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + VISION_API_KEY;
    
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 10
            }
          ],
          imageContext: {
            languageHints: ["ja", "en"]
          }
        }
      ]
    };

    console.log('Sending request to Vision API...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Vision API Error:', data);
      throw new Error(data.error?.message || 'Vision API request failed');
    }

    // Get all detected text blocks
    const textBlocks = data.responses[0]?.textAnnotations || [];
    if (textBlocks.length === 0) {
      console.log('No text detected in image');
      return null;
    }

    // Get the full text and individual blocks
    const fullText = textBlocks[0].description;
    console.log('Raw detected text:', fullText);

    // Look for price patterns in each text block
    for (const block of textBlocks) {
      const text = block.description;
      console.log('Processing text block:', text);
      
      // Try different Japanese price formats
      const patterns = [
        /¥\s*(\d+(?:,\d{3})*)/,      // Matches ¥2000 or ¥2,000
        /(\d+(?:,\d{3})*)\s*円/,      // Matches 2000円 or 2,000円
        /(\d+(?:,\d{3})*)-/           // Matches 2000- or 2,000-
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          console.log(`Match found with pattern ${pattern}:`, match[0]);
          
          // Clean up the price string and handle commas as thousand separators
          const priceStr = match[1].replace(/[¥\s]/g, '');
          // Convert string with commas directly to number
          const price = parseInt(priceStr.replace(/,/g, ''), 10);
          
          console.log('Extracted price string:', priceStr);
          console.log('Final price number:', price);
          
          // Validate the price is reasonable (between 1 and 10,000,000 yen)
          if (!isNaN(price) && price >= 1 && price <= 10000000) {
            return price;
          }
        }
      }
    }

    console.log('No valid price pattern found');
    return null;

  } catch (error) {
    console.error('Error detecting price:', error);
    throw error;
  }
}; 