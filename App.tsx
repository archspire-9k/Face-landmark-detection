/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';

import { Camera, useCameraDevices } from 'react-native-vision-camera';

import {
  View,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';

function App(): JSX.Element {

  const devices = useCameraDevices();
  const device = devices.back;
  const [cameraOn, setCameraOn] = useState(false);
  const [permissions, setPermissions] = useState(false);
  
  const getPermissions = async () => {
    const cameraPermission = await Camera.getCameraPermissionStatus();
    if (cameraPermission === 'authorized') {
      setPermissions(true);
    }
  };
  
  const requestPermissions = async () => {
    const newCameraPermission = await Camera.requestCameraPermission().catch((error) => console.warn("camera error:", error));
    if (newCameraPermission === 'authorized') {
      setPermissions(true);
    }
  };
  
  useEffect(() => {
    getPermissions();
  }, []);
  
  if (!permissions) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No permissions</Text>
        <Button title = "Request Permission" onPress={requestPermissions}></Button>
      </View>
    );
  }
  
  if (!device) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading</Text>
      </View>
    );
  }
  
  if (!cameraOn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Turn on the camera</Text>
        <TouchableOpacity onPress={() => setCameraOn(true)} style={{ marginTop: 30, backgroundColor: '#28a745' }}>
          <Text style={{ marginHorizontal: 20, marginVertical: 10, color: 'white' }}>ON</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
    />
  );
  
}



export default App;
