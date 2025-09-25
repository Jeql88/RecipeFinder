// components/SkeletonLoader.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  interpolate,
  Extrapolate 
} from 'react-native-reanimated';
import { useSkeletonAnimation } from '../app/hooks/useTheme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  children?: React.ReactNode;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  children,
}) => {
  const { skeletonOpacity, skeletonScale, isLoading } = useSkeletonAnimation();

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      skeletonOpacity.value,
      [0, 0.5, 1],
      [0.3, 0.7, 0.3],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      skeletonScale.value,
      [0, 0.5, 1],
      [0.95, 1.05, 0.95],
      Extrapolate.CLAMP
    );

    return {
      opacity: isLoading ? opacity : 0,
      transform: [{ scale: isLoading ? scale : 1 }],
    };
  });

  if (!isLoading && children) {
    return <>{children}</>;
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
});

export default SkeletonLoader;
