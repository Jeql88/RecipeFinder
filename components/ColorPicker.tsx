// app/components/ColorPicker.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '../app/hooks/useTheme';

interface ColorPickerProps {
  label: string;
  color: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  // Spotify Brand Colors
  '#1DB954', '#1ED760', '#191414',
  // Popular Brand Colors
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#FFB347', '#87CEEB', '#F0E68C',
  // Purple Theme
  '#9D4EDD', '#C77DFF', '#E0AAFF', '#5A189A', '#240046',
  // Orange Theme
  '#FF9500', '#FF6000', '#FF3300', '#FF5722', '#FF8C00',
  // Blue Theme
  '#007AFF', '#0066CC', '#004499', '#5AC8FA', '#00D4FF',
  // Pink Theme
  '#FF69B4', '#FFB6C1', '#FF1493', '#FF20B2', '#C71585',
  // Green Theme
  '#32D74B', '#30D158', '#28CD41', '#00FF00', '#00C957',
  // Red Theme
  '#FF3B30', '#FF2D92', '#FF453A', '#DC3545', '#E74C3C',
];

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onColorChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { colors } = useTheme();

  const handleColorSelect = (selectedColor: string) => {
    onColorChange(selectedColor);
    setIsVisible(false);
  };

  return (
    <>
      <View style={[styles.container, { borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <TouchableOpacity
          style={[styles.colorButton, { backgroundColor: color, borderColor: colors.border }]}
          onPress={() => setIsVisible(true)}
        >
          <View style={[styles.colorPreview, { backgroundColor: color }]} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Choose {label} Color
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.surface }]}
                onPress={() => setIsVisible(false)}
              >
                <Text style={[styles.closeButtonText, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.colorGrid}>
              {PRESET_COLORS.map((presetColor, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: presetColor },
                    color === presetColor && { borderWidth: 3, borderColor: colors.text }
                  ]}
                  onPress={() => handleColorSelect(presetColor)}
                >
                  {color === presetColor && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.currentColorSection}>
              <Text style={[styles.currentColorLabel, { color: colors.textSecondary }]}>
                Current Color: {color}
              </Text>
              <View style={[styles.currentColorPreview, { backgroundColor: color }]} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedIndicator: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  currentColorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  currentColorLabel: {
    fontSize: 14,
    flex: 1,
  },
  currentColorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
});

export default ColorPicker;