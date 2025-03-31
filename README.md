# Currency Snap

A React Native mobile app that uses computer vision to detect and convert Japanese price tags to different currencies in real-time.

## Features

- Real-time price detection from Japanese price tags using camera
- Supports various Japanese price formats (¥2,000, 2,000円, etc.)
- Currency conversion to USD, MXN, and PEN
- Clean and intuitive UI with frame-based detection
- Proper currency formatting with thousand separators and decimals

## Tech Stack

- React Native with Expo
- Google Cloud Vision API for text detection
- TypeScript for type safety
- Real-time currency conversion

## Prerequisites

- Node.js 14+
- Expo CLI
- Google Cloud Vision API key
- Android Studio (for Android development)
- Xcode (for iOS development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vicsuarez/currency-snap.git
cd currency-snap
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Google Cloud Vision API key:
- Replace `YOUR_API_KEY` in `services/vision-service.ts` with your actual API key

4. Start the development server:
```bash
npx expo start
```

## Usage

1. Open the app on your device
2. Point the camera at a Japanese price tag
3. Align the price within the detection frame
4. The app will detect the price and show conversions
5. View real-time currency conversions below

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Version History

### v1.0.0
- Initial release
- Real-time price detection
- Currency conversion support
- Frame-based detection UI
- Proper currency formatting 