# Global Weather Map - 10 Day Forecast

A beautiful, interactive weather website that displays weather information for locations worldwide with current temperature and 10-day forecasts on an interactive map.

## Features

- 🌍 **Interactive World Map**: Click anywhere on the map to get weather data
- 🌡️ **Current Weather**: Real-time temperature, humidity, wind speed, and visibility
- 📅 **10-Day Forecast**: Detailed weather predictions for the next 10 days
- 🔍 **Location Search**: Search for any city or location worldwide
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🎨 **Beautiful UI**: Modern, gradient design with smooth animations
- ⚡ **Fast Loading**: Optimized for quick data retrieval and display

## Demo

The website includes a demo mode that works without an API key, showing sample weather data for demonstration purposes.

## Setup Instructions

### 1. Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key
4. Copy your API key

### 2. Configure the API Key

1. Open `script.js`
2. Find the line: `const WEATHER_API_KEY = 'demo';`
3. Replace `'demo'` with your actual API key:
   ```javascript
   const WEATHER_API_KEY = 'your_api_key_here';
   ```

### 3. Run the Website

Simply open `index.html` in your web browser. No server setup required!

## File Structure

```
weather-website/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## How to Use

1. **View Weather on Map**: Click anywhere on the world map to see weather data for that location
2. **Search Locations**: Use the search bar to find specific cities or locations
3. **View Details**: Click on weather markers to see detailed information
4. **Check Forecast**: The right panel shows current weather and 10-day forecast
5. **Explore**: The map loads with popular cities by default

## API Endpoints Used

- **Current Weather**: `https://api.openweathermap.org/data/2.5/weather`
- **5-Day Forecast**: `https://api.openweathermap.org/data/2.5/forecast`
- **Geocoding**: `https://api.openweathermap.org/geo/1.0/direct`

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: Interactive functionality
- **Leaflet.js**: Interactive map library
- **OpenWeatherMap API**: Weather data source
- **Font Awesome**: Weather and UI icons

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Customization

### Adding More Cities on Load
Edit the `loadPopularCities()` function in `script.js` to add more default cities.

### Changing Map Style
Replace the tile layer URL in the `initializeMap()` function to use different map styles.

### Modifying Weather Icons
Update the `getWeatherIcon()` function to use different icon sets or styles.

## Troubleshooting

### API Key Issues
- Ensure your API key is correctly placed in `script.js`
- Check that your OpenWeatherMap account is active
- Verify the API key has the necessary permissions

### Map Not Loading
- Check your internet connection
- Ensure Leaflet.js is loading properly
- Try refreshing the page

### Weather Data Not Showing
- Verify your API key is valid
- Check browser console for error messages
- Ensure you haven't exceeded API rate limits

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this weather website.

## Support

For support or questions, please check the troubleshooting section above or create an issue in the project repository.