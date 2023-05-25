import { runOnJS, runOnUI, useSharedValue } from 'react-native-reanimated'
import React, { useEffect, useState, useRef } from 'react';
import Icon from "react-native-vector-icons/Feather";

import { Camera, useCameraDevices, CameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import {
  View,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import { useIsForeground } from './src/hooks/useIsForeground';
import { scanBarcodes, BarcodeFormat, Barcode } from 'vision-camera-code-scanner';
import Clipboard from '@react-native-clipboard/clipboard';


function App(): JSX.Element {

  const devices = useCameraDevices();
  const device = devices.back;
  const isForeground = useIsForeground();
  const barcodeScanned = useSharedValue(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [permissions, setPermissions] = useState(false);
  const [cameraList, setCameraList] = useState<CameraDevice[]>([]);
  const [copiedText, setCopiedText] = useState('');
  const [barcodes, setBarcodes] = useState<Barcode[]>([])

  const copyToClipboard = (text: any) => {
    if (text != undefined) {
      Clipboard.setString(text);
    }
    else {
      Alert.alert("No QR Code found", "Please try scanning again",
        [{
          text: 'Ask me later',
          onPress: () => console.log('Ask me later pressed'),
        }]);
    }
  };

  const isValidWebsite = (str: any) => {
    try {
      if (str != undefined) {
        return str.startsWith("http://") || str.startsWith("https://");
      }
    } catch (err) {
      return false;
    }
  }

  const handlePress = (str: any) => {
    if (isValidWebsite(str)) {
      Linking.openURL('http://google.com');
      console.log("tested")
    }
  };

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


  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!barcodeScanned.value) {
      const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE], { checkInverted: true });
      runOnJS(setBarcodes)(detectedBarcodes);
      //check if camera device is still running
      //console.log("Running camera")
      if (detectedBarcodes.length > 0) {
        runOnJS(setCameraOn)(false);
      }
    }
  }, []);

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
        <TouchableOpacity onPress={() => setCameraOn(true)} style={{ marginVertical: 30, backgroundColor: '#28a745' }}>
          <Text style={{ marginHorizontal: 20, marginVertical: 10, color: 'white' }}>ON</Text>
        </TouchableOpacity>

        {barcodes.map((barcode, idx) => (
          <View key={idx} style={{ flexDirection: 'row', marginVertical: 20 }}>
            <View style={{
              width: 300
            }}>
              <Text
                style={[styles.barcodeTextURL, { color: isValidWebsite(barcode.displayValue) ? 'green' : 'white' }]}
                onPress={() => {
                  handlePress(barcode.displayValue)
                }}>
                {barcode.displayValue}
              </Text>
            </View>
            <Icon name="clipboard" size={24} color="white" onPress={() => copyToClipboard(barcode.displayValue)} />
          </View>
        ))}
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
    </>
  );

}

const styles = StyleSheet.create({
  barcodeTextURL: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 24
  },
});

export default App;
