import 'react-native-reanimated'
import React, { useEffect, useState, useRef } from 'react';

import { Camera, useCameraDevices, CameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import {
  View,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import { useIsForeground } from './src/hooks/useIsForeground';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';


function App(): JSX.Element {

  const devices = useCameraDevices();
  const device = devices.back;
  const isForeground = useIsForeground();

  const [cameraOn, setCameraOn] = useState(false);
  const [permissions, setPermissions] = useState(false);
  const [cameraList, setCameraList] = useState<CameraDevice[]>([]);
  

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
    else if (newCameraPermission === 'denied') {
      //todo: link to setting to change manually
    }
  };

  const getAllCams = async () => {
    const allCams = await Camera.getAvailableCameraDevices().catch((error) => console.warn("Problem getting camera devices:", error));
    if (allCams !== undefined) {
      setCameraList(allCams)
    } else {
      setCameraList([]) // set default value
    }

    return () => {
      console.log("Returned all cameras")
    }
  };


  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

  useEffect(() => {
    getPermissions();
    getAllCams();

  }, []);

  if (!permissions) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No permissions</Text>
        <Button title="Request Permission" onPress={requestPermissions}></Button>
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
        <Text style={{ marginHorizontal: 20, marginVertical: 10, color: 'white' }}>{cameraList.map(obj => obj.supportsParallelVideoProcessing.toString())}</Text>
      </View>
    );
  }

  return (
    <>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isForeground}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      {barcodes.map((barcode, idx) => (
        <Text key={idx} style={styles.barcodeTextURL}>
          {barcode.displayValue}
        </Text>
      ))}
    </>
  );

}

const styles = StyleSheet.create({
  barcodeTextURL: {
    position: 'absolute',
    bottom: 50,
    left: 100,
    right: 100,
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: '#28a745',
  },
});

export default App;
