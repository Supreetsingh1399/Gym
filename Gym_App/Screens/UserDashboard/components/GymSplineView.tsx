import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import { 
  Scene, 
  PerspectiveCamera, 
  AmbientLight, 
  DirectionalLight, 
  BufferGeometry,
  Vector3,
  CatmullRomCurve3,
  LineBasicMaterial,
  Line,
  MeshStandardMaterial,
  SphereGeometry,
  BoxGeometry,
  Mesh,
  Group,
  CircleGeometry,
  MeshBasicMaterial,
  DoubleSide
} from 'three';
import createOrbitControlsView from 'expo-three-orbit-controls';
import { Ionicons } from '@expo/vector-icons';
import { ExpoWebGLRenderingContext } from 'expo-gl';

// Define the global object type for toggleRoute
declare global {
  var toggleRoute: (() => void) | undefined;
}

// Define gym interface
interface GymViewProps {
  id: string;
  gymName: string;
  rating?: number;
  distance?: string;
  location: {
    address: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

// Define route animation type
interface RouteAnimation {
  curve: CatmullRomCurve3;
  travelSphere: Mesh;
}

// Component for 3D gym visualization
const GymSplineView: React.FC<{ gym: GymViewProps }> = ({ gym }) => {
  const [showHelp, setShowHelp] = useState<boolean>(true);
  const [showingRoute, setShowingRoute] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const animationRef = useRef<number | null>(null);
  
  // Create a 3D visualization of the gym
  const onContextCreate = async (gl: ExpoWebGLRenderingContext): Promise<() => void> => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    
    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x121212);
    
    // Create scene
    const scene = new Scene();
    
    // Create camera
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    
    // Set up orbit controls
    const controls = createOrbitControlsView(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    
    // Add lights
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Create a group to hold gym elements
    const gymGroup = new Group();
    scene.add(gymGroup);
    
    // Create gym floor
    const floorGeometry = new CircleGeometry(7, 32);
    const floorMaterial = new MeshStandardMaterial({ 
      color: 0x333333,
      side: DoubleSide
    });
    const floor = new Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = Math.PI / 2;
    floor.position.y = -1;
    gymGroup.add(floor);
    
    // Create gym building
    const gymBuildingGeometry = new BoxGeometry(10, 3, 8);
    const gymBuildingMaterial = new MeshStandardMaterial({ 
      color: 0x2c5282, // Blue 800
      transparent: true,
      opacity: 0.7
    });
    const gymBuilding = new Mesh(gymBuildingGeometry, gymBuildingMaterial);
    gymBuilding.position.y = 0.5;
    gymGroup.add(gymBuilding);
    
    // Create entrance
    const entranceGeometry = new BoxGeometry(2, 2, 0.5);
    const entranceMaterial = new MeshStandardMaterial({ color: 0xf59e0b }); // Amber 500
    const entrance = new Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(0, 0, 4);
    gymGroup.add(entrance);
    
    // Create a route to the gym using spline
    const createRoute = (): RouteAnimation => {
      // Remove existing route if any
      const existingRoute = gymGroup.getObjectByName("gymRoute");
      if (existingRoute) {
        gymGroup.remove(existingRoute);
      }
      
      // Create a route group
      const routeGroup = new Group();
      routeGroup.name = "gymRoute";
      
      // Create spline path
      const pathPoints = [
        new Vector3(-15, 0, -15),
        new Vector3(-10, 0, -5),
        new Vector3(-5, 0, 0),
        new Vector3(0, 0, 4)
      ];
      
      const curve = new CatmullRomCurve3(pathPoints);
      const points = curve.getPoints(100);
      const splineGeometry = new BufferGeometry().setFromPoints(points);
      const splineMaterial = new LineBasicMaterial({ color: 0xff00ff });
      const splineObject = new Line(splineGeometry, splineMaterial);
      routeGroup.add(splineObject);
      
      // Add waypoints
      const waypointGeometry = new SphereGeometry(0.3, 16, 16);
      const waypointMaterial = new MeshStandardMaterial({ color: 0x00aaff });
      
      pathPoints.forEach((point) => {
        const waypoint = new Mesh(waypointGeometry, waypointMaterial);
        waypoint.position.copy(point);
        routeGroup.add(waypoint);
      });
      
      // Create traveling sphere for animation
      const travelSphereGeometry = new SphereGeometry(0.5, 32, 32);
      const travelSphereMaterial = new MeshStandardMaterial({ color: 0xffaa00 });
      const travelSphere = new Mesh(travelSphereGeometry, travelSphereMaterial);
      travelSphere.name = "travelSphere";
      routeGroup.add(travelSphere);
      
      gymGroup.add(routeGroup);
      
      // Return the curve for animation
      return { curve, travelSphere };
    };
    
    let routeAnimation: RouteAnimation | null = null;
    
    // Add rating stars
    const addRatingStars = (): void => {
      const rating = gym?.rating || 4.0;
      const fullStars = Math.floor(rating);
      
      const starGroup = new Group();
      starGroup.position.set(0, 3, 0);
      
      for (let i = 0; i < 5; i++) {
        const color = i < fullStars ? 0xfcd34d : 0x666666;
        const starGeometry = new SphereGeometry(0.3, 16, 16);
        const starMaterial = new MeshStandardMaterial({ color });
        const star = new Mesh(starGeometry, starMaterial);
        star.position.x = (i - 2) * 0.8;
        starGroup.add(star);
      }
      
      gymGroup.add(starGroup);
    };
    
    // Add gym equipment
    const addGymEquipment = (): void => {
      // Treadmill
      const treadmillGeometry = new BoxGeometry(1.5, 0.5, 3);
      const treadmillMaterial = new MeshStandardMaterial({ color: 0x333333 });
      const treadmill = new Mesh(treadmillGeometry, treadmillMaterial);
      treadmill.position.set(-3, -0.25, 0);
      gymGroup.add(treadmill);
      
      // Weights rack
      const racksGeometry = new BoxGeometry(3, 2, 1);
      const racksMaterial = new MeshStandardMaterial({ color: 0x555555 });
      const racks = new Mesh(racksGeometry, racksMaterial);
      racks.position.set(3, 0, 0);
      gymGroup.add(racks);
      
      // Gym bench
      const benchGeometry = new BoxGeometry(2, 0.5, 1);
      const benchMaterial = new MeshStandardMaterial({ color: 0xee0000 });
      const bench = new Mesh(benchGeometry, benchMaterial);
      bench.position.set(3, -0.25, -2);
      gymGroup.add(bench);
    };
    
    // Initialize the scene
    const init = (): void => {
      addRatingStars();
      addGymEquipment();
      setInitializing(false);
      
      // Create address text placeholder (would need a text sprite library in a real app)
      const addressSphere = new Mesh(
        new SphereGeometry(0.2, 8, 8),
        new MeshBasicMaterial({ color: 0xffffff })
      );
      addressSphere.position.set(0, 4, 0);
      gymGroup.add(addressSphere);
    };
    
    init();
    
    // Animation loop
    let t = 0;
    const render = (): void => {
      // Animate route if showing
      if (showingRoute && routeAnimation) {
        t = (t + 0.005) % 1;
        const position = routeAnimation.curve.getPointAt(t);
        if (position) {
          routeAnimation.travelSphere.position.copy(position);
        }
      }
      
      // Auto-rotate the gym slightly for a dynamic view
      gymGroup.rotation.y += 0.002;
      
      // Update controls
      controls.update();
      
      // Render the scene
      (renderer as any).render(scene, camera);
      gl.endFrameEXP();
      
      // Request next frame
      animationRef.current = requestAnimationFrame(render);
    };
    
    // Start render loop
    render();
    
    // Toggle route function for button
    global.toggleRoute = (): void => {
      if (!showingRoute) {
        routeAnimation = createRoute();
        setShowingRoute(true);
      } else {
        const existingRoute = gymGroup.getObjectByName("gymRoute");
        if (existingRoute) {
          gymGroup.remove(existingRoute);
          routeAnimation = null;
        }
        setShowingRoute(false);
      }
    };
    
    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Clean up Three.js resources
      renderer.dispose();
      controls.dispose();
    };
  };
  
  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Handle route toggle button press
  const handleToggleRoute = (): void => {
    if (global.toggleRoute) {
      global.toggleRoute();
    }
  };
  
  // Handle help toggle
  const handleToggleHelp = (): void => {
    setShowHelp(!showHelp);
  };
  
  return (
    <View className="flex-1">
      <GLView
        className="flex-1"
        onContextCreate={onContextCreate}
      />
      
      {initializing && (
        <View style={{
          position: 'absolute',
          top: 0, bottom: 0, left: 0, right: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)'
        }}>
          <Text style={{ color: 'white', fontSize: 18 }}>Initializing 3D View...</Text>
        </View>
      )}
      
      {showHelp && (
        <View style={{
          position: 'absolute',
          bottom: 80,
          left: 16,
          right: 16,
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: 8,
          padding: 16
        }}>
          <Text style={{ color: 'white', fontSize: 14, marginBottom: 8 }}>🔄 Rotate: Drag with one finger</Text>
          <Text style={{ color: 'white', fontSize: 14, marginBottom: 8 }}>👌 Zoom: Pinch with two fingers</Text>
          <Text style={{ color: 'white', fontSize: 14, marginBottom: 8 }}>💫 Move: Drag with two fingers</Text>
          <Pressable 
            style={{ marginTop: 8, alignSelf: 'flex-end' }}
            onPress={handleToggleHelp}
          >
            <Text style={{ color: '#60a5fa' }}>Dismiss</Text>
          </Pressable>
        </View>
      )}
      
      <View style={{
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row'
      }}>
        <Pressable
          style={{
            width: 40,
            height: 40,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8
          }}
          onPress={handleToggleRoute}
        >
          <Ionicons name="navigate" size={24} color={showingRoute ? "#ff00ff" : "white"} />
        </Pressable>
        
        <Pressable
          style={{
            width: 40,
            height: 40,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onPress={handleToggleHelp}
        >
          <Ionicons name="help" size={24} color="white" />
        </Pressable>
      </View>
      
      {/* Gym info overlay */}
      <View style={{
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 8,
        padding: 12,
        maxWidth: 240
      }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{gym?.gymName || "Fitness Gym"}</Text>
        {gym?.rating !== undefined && (
          <Text style={{ color: '#fcd34d' }}>
            {"★".repeat(Math.round(gym.rating))} ({gym.rating.toFixed(1)})
          </Text>
        )}
        {gym?.distance && (
          <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>Distance: {gym.distance}</Text>
        )}
      </View>
    </View>
  );
};

export default GymSplineView;