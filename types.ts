
export interface PinData {
  id: string;
  position: [number, number, number];
  normal: [number, number, number];
  color: string;
  targetName: string;
}

export interface DollState {
  name: string;
  faceImageUrl: string | null;
  pins: PinData[];
}
