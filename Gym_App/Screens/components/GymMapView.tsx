import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface GymMapViewProps {
  gym: {
    id: string;
    gymName: string;
    imageUrl?: string;
    source: 'google' | 'internal';
    geometry?: {
      location: {
        lat: number;
        lng: number;
      }
    }
    address?: string;
  };
  showHeader?: boolean;
  showImage?: boolean;
  onNavigate?: () => void;
}

const GymMapView: React.FC<GymMapViewProps> = ({ 
  gym,
  showHeader = false,
  showImage = false,
  onNavigate 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract coordinates from gym data
  const latitude = gym.geometry?.location.lat || 0;
  const longitude = gym.geometry?.location.lng || 0;
  const placeId = gym.source === 'google' ? gym.id.replace("google-", "") : null;
  
  // Generate Google Maps URL for iframe
  const generateGoogleMapsUrl = () => {
    if (gym.source === 'google' && placeId) {
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBNBe5L8c3eCem7vbQUbfbe00nNHereVSk&q=place_id:${placeId}&zoom=17`;
    } else if (latitude && longitude) {
      return `https://www.google.com/maps/embed/v1/view?key=AIzaSyBNBe5L8c3eCem7vbQUbfbe00nNHereVSk&center=${latitude},${longitude}&zoom=17`;
    } else {
      return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBNBe5L8c3eCem7vbQUbfbe00nNHereVSk&q=${encodeURIComponent(gym.gymName)}`;
    }
  };
  
  // Create HTML with iframe for WebView
  const createHTML = () => {
    const mapUrl = generateGoogleMapsUrl();
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            body {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              overflow: hidden;
              background-color: #000;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
              position: absolute;
              top: 0;
              left: 0;
            }
            .loading {
              display: none;
            }
          </style>
        </head>
        <body>
          <iframe 
            src="${mapUrl}" 
            allowfullscreen
            onload="document.getElementById('loading').style.display='none';"
          ></iframe>
          <div id="loading" class="loading"></div>
        </body>
      </html>
    `;
  };
  
  return (
    <View className="flex-1 bg-black">
      <WebView
        source={{ html: createHTML() }}
        className="flex-1"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
      
      {isLoading && (
        <View className="absolute inset-0 bg-black/70 justify-center items-center">
          <ActivityIndicator size="large" color="#0091EA" />
        </View>
      )}
    </View>
  );
};

export default GymMapView;