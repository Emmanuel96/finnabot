import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CameraPageProps {
  navigation?: any; // Add proper navigation type if using React Navigation
}

const CameraPage: React.FC<CameraPageProps> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      // Request media library permission
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaLibraryStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async (): Promise<void> => {
    if (cameraRef.current) {
      try {
        setIsLoading(true);
        
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: false,
        });
        
        if (photo?.uri) {
          // Optional: Manipulate image (resize, rotate, etc.)
          const manipulatedImage = await manipulateAsync(
            photo.uri,
            [{ resize: { width: 1000 } }], // Resize to max width of 1000px
            { compress: 0.8, format: SaveFormat.JPEG }
          );
          
          setCapturedImage(manipulatedImage.uri);
        }
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
        setIsLoading(false);
      }
    }
  };

  const saveImage = async (): Promise<void> => {
    if (capturedImage && hasMediaLibraryPermission) {
      try {
        await MediaLibrary.saveToLibraryAsync(capturedImage);
        Alert.alert('Success', 'Image saved to gallery!');
      } catch (error) {
        console.error('Error saving image:', error);
        Alert.alert('Error', 'Failed to save image');
      }
    } else {
      Alert.alert('Permission Required', 'Media library permission is required to save images');
    }
  };

  const retakePhoto = (): void => {
    setCapturedImage(null);
  };

  const toggleCameraType = (): void => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = (): void => {
    setFlash(current => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
          return 'off';
        default:
          return 'off';
      }
    });
  };

  const getFlashIcon = (): string => {
    switch (flash) {
      case 'on':
        return '⚡';
      case 'auto':
        return '⚡A';
      case 'off':
      default:
        return '⚡/';
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          <View style={styles.previewControls}>
            <TouchableOpacity style={styles.controlButton} onPress={retakePhoto}>
              <Text style={styles.controlButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={saveImage}>
              <Text style={styles.controlButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        <View style={styles.cameraControls}>
          {/* Top controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlIcon} onPress={toggleFlash}>
              <Text style={styles.controlIconText}>{getFlashIcon()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlIcon} onPress={toggleCameraType}>
              <Text style={styles.controlIconText}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <View style={styles.captureButtonContainer}>
              <TouchableOpacity
                style={[styles.captureButton, isLoading && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={isLoading}
              >
                <View style={styles.captureButtonInner}>
                  {isLoading && <Text style={styles.loadingText}>📷</Text>}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomControls: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  controlIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIconText: {
    fontSize: 24,
    color: 'white',
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraPage;