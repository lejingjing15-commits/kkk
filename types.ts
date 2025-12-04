
import { Vector3 } from 'three';

export interface RoseProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
  delay?: number;
}

export interface PetalData {
  position: Vector3;
  rotation: [number, number, number];
  scale: [number, number, number];
}

export type ThemeColor = 'tatami' | 'midnight';
