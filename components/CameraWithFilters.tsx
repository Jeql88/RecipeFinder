import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, Dimensions, ScrollView, Image } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { GLView } from 'expo-gl';
import { manipulateAsync, SaveFormat, FlipType } from 'expo-image-manipulator';
import { useTheme } from '../app/hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface CameraWithFiltersProps {
  visible: boolean;
  onClose: () => void;
  onPhotoTaken: (uri: string) => void;
}

export default function CameraWithFilters({ visible, onClose, onPhotoTaken }: CameraWithFiltersProps) {
  const { colors } = useTheme();
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [currentFilter, setCurrentFilter] = useState<'none' | 'grayscale' | 'sepia'>('none');
  const [filterIntensity, setFilterIntensity] = useState(1);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [editedUri, setEditedUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        setCapturedUri(photo.uri);
        setEditedUri(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => current === 'back' ? 'front' : 'back');
  };

  const rotateImage = async () => {
    if (!editedUri) return;
    try {
      const manipulated = await manipulateAsync(editedUri, [{ rotate: 90 }], { compress: 0.7, format: SaveFormat.JPEG });
      setEditedUri(manipulated.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to rotate image');
    }
  };

  const cropImage = async () => {
    if (!editedUri) return;
    try {
      // Simple crop to square (assuming landscape, crop center)
      const manipulated = await manipulateAsync(editedUri, [{ crop: { originX: 100, originY: 50, width: 300, height: 300 } }], { compress: 0.7, format: SaveFormat.JPEG });
      setEditedUri(manipulated.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to crop image');
    }
  };

  const applyFilter = async () => {
    if (!editedUri) return;
    try {
      let actions: any[] = [];
      if (currentFilter === 'grayscale') {
        actions = [{ saturation: 0 }];
      } else if (currentFilter === 'sepia') {
        actions = [{ saturation: 0.2 }, { contrast: 1.2 }, { brightness: 1.1 }];
      }
      if (actions.length > 0) {
        const manipulated = await manipulateAsync(editedUri, actions, { compress: 0.7, format: SaveFormat.JPEG });
        setEditedUri(manipulated.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to apply filter');
    }
  };

  const saveImage = () => {
    if (editedUri) {
      onPhotoTaken(editedUri);
      reset();
    }
  };

  const retake = () => {
    reset();
  };

  const reset = () => {
    setCapturedUri(null);
    setEditedUri(null);
    setCurrentFilter('none');
    setFilterIntensity(1);
  };

  const onContextCreate = async (gl: any) => {
    // For now, basic setup. Filters will be added later.
  };

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.text, { color: colors.text }]}>Requesting camera permission...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.text, { color: colors.text }]}>No access to camera</Text>
          <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: colors.primary }]}>
            <Text style={[styles.buttonText, { color: colors.text }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {capturedUri ? (
          <View style={styles.editingContainer}>
            <Image source={{ uri: editedUri || capturedUri }} style={styles.editedImage} />
            <View style={styles.editingControls}>
              <TouchableOpacity onPress={rotateImage} style={[styles.editButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.editText, { color: colors.text }]}>Rotate</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cropImage} style={[styles.editButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.editText, { color: colors.text }]}>Crop</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyFilter} style={[styles.editButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.editText, { color: colors.text }]}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.finalControls}>
              <TouchableOpacity onPress={retake} style={[styles.controlButton, { backgroundColor: colors.surface }]}>
                <Text style={[styles.controlText, { color: colors.text }]}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveImage} style={[styles.captureButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.captureText, { color: colors.text }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.cameraContainer}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={cameraType}
              />
            </View>

            <View style={styles.filterControls}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                <TouchableOpacity
                  onPress={() => setCurrentFilter('none')}
                  style={[styles.filterButton, { backgroundColor: currentFilter === 'none' ? colors.primary : colors.surface }]}
                >
                  <Text style={[styles.filterText, { color: colors.text }]}>None</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCurrentFilter('grayscale')}
                  style={[styles.filterButton, { backgroundColor: currentFilter === 'grayscale' ? colors.primary : colors.surface }]}
                >
                  <Text style={[styles.filterText, { color: colors.text }]}>Grayscale</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCurrentFilter('sepia')}
                  style={[styles.filterButton, { backgroundColor: currentFilter === 'sepia' ? colors.primary : colors.surface }]}
                >
                  <Text style={[styles.filterText, { color: colors.text }]}>Sepia</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={styles.intensityControls}>
              <Text style={[styles.intensityLabel, { color: colors.text }]}>Intensity: {filterIntensity.toFixed(1)}</Text>
              <View style={styles.sliderContainer}>
                <TouchableOpacity onPress={() => setFilterIntensity(Math.max(0, filterIntensity - 0.1))} style={styles.sliderButton}>
                  <Text style={[styles.sliderText, { color: colors.text }]}>-</Text>
                </TouchableOpacity>
                <View style={[styles.sliderTrack, { backgroundColor: colors.surface }]}>
                  <View
                    style={[
                      styles.sliderFill,
                      { backgroundColor: colors.primary, width: `${filterIntensity * 100}%` }
                    ]}
                  />
                </View>
                <TouchableOpacity onPress={() => setFilterIntensity(Math.min(1, filterIntensity + 0.1))} style={styles.sliderButton}>
                  <Text style={[styles.sliderText, { color: colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity onPress={toggleCameraType} style={[styles.controlButton, { backgroundColor: colors.surface }]}>
                <Text style={[styles.controlText, { color: colors.text }]}>Flip</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={takePicture} style={[styles.captureButton, { backgroundColor: colors.primary }]}>
                <Text style={[styles.captureText, { color: colors.text }]}>Capture</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onClose} style={[styles.controlButton, { backgroundColor: colors.surface }]}>
                <Text style={[styles.controlText, { color: colors.text }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
  },
  camera: {
    flex: 1,
  },
  filterControls: {
    paddingVertical: 10,
    width: '100%',
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  intensityControls: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  intensityLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  sliderButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
  },
  sliderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 5,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  controlButton: {
    padding: 10,
    borderRadius: 5,
  },
  controlText: {
    fontSize: 16,
  },
  captureButton: {
    padding: 15,
    borderRadius: 30,
  },
  captureText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 18,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
  },
  editingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editedImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  editingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 10,
  },
  editButton: {
    padding: 10,
    borderRadius: 5,
  },
  editText: {
    fontSize: 16,
  },
  finalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
  },
});