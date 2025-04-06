declare module "react-native-maps" {
  import React from "react";

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface LatLng {
    latitude: number;
    longitude: number;
  }

  export interface MapViewProps {
    provider?: "google" | "apple" | undefined;
    initialRegion?: Region;
    region?: Region;
    onRegionChange?: (region: Region) => void;
    onRegionChangeComplete?: (region: Region) => void;
    onPress?: (event: any) => void;
    onLongPress?: (event: any) => void;
    style?: any;
    className?: string;
    children?: React.ReactNode;
    showsUserLocation?: boolean;
    followsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    showsPointsOfInterest?: boolean;
    showsCompass?: boolean;
    showsTraffic?: boolean;
    showsBuildings?: boolean;
    showsIndoors?: boolean;
    zoomEnabled?: boolean;
    rotateEnabled?: boolean;
    scrollEnabled?: boolean;
    pitchEnabled?: boolean;
    toolbarEnabled?: boolean;
    cacheEnabled?: boolean;
    loadingEnabled?: boolean;
    loadingIndicatorColor?: string;
    loadingBackgroundColor?: string;
    mapPadding?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  }

  export interface MarkerProps {
    coordinate: LatLng;
    title?: string;
    description?: string;
    onPress?: (event: any) => void;
    onCalloutPress?: (event: any) => void;
    onDragStart?: (event: any) => void;
    onDrag?: (event: any) => void;
    onDragEnd?: (event: any) => void;
    anchor?: { x: number; y: number };
    draggable?: boolean;
    pinColor?: string;
    rotation?: number;
    opacity?: number;
    flat?: boolean;
    style?: any;
    image?: any;
    className?: string;
  }

  export default class MapView extends React.Component<MapViewProps, any> {
    static Marker: React.ComponentType<MarkerProps>;
    static Callout: React.ComponentType<any>;
    static Circle: React.ComponentType<any>;
    static Polygon: React.ComponentType<any>;
    static Polyline: React.ComponentType<any>;
    static Heatmap: React.ComponentType<any>;
    static Overlay: React.ComponentType<any>;
  }

  export class Marker extends React.Component<MarkerProps, any> {
    // Marker component
  }

  export class Callout extends React.Component<any, any> {
    // Callout component
  }

  export class Overlay extends React.Component<any, any> {
    // Overlay component
  }
}
