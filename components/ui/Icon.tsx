import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Polyline, Line, Polygon } from 'react-native-svg';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#9CA3AF',
  strokeWidth = 1.5,
}) => {
  const props = {
    stroke: color,
    strokeWidth,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const icons: Record<string, React.ReactNode> = {
    home: (
      <>
        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...props} />
        <Polyline points="9,22 9,12 15,12 15,22" {...props} />
      </>
    ),
    // qr: (
    //   <>
    //     <Rect x="3" y="3" width="7" height="7" rx="1" {...props} />
    //     <Rect x="14" y="3" width="7" height="7" rx="1" {...props} />
    //     <Rect x="14" y="14" width="7" height="7" rx="1" {...props} />
    //     <Rect x="3" y="14" width="7" height="7" rx="1" {...props} />
    //   </>
    // ),
    users: (
      <>
        <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...props} />
        <Circle cx="9" cy="7" r="4" {...props} />
        <Path d="M23 21v-2a4 4 0 0 0-3-3.87" {...props} />
        <Path d="M16 3.13a4 4 0 0 1 0 7.75" {...props} />
      </>
    ),
    settings: (
      <>
        <Circle cx="12" cy="12" r="3" {...props} />
        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" {...props} />
      </>
    ),
    'arrow-left': (
      <>
        <Line x1="19" y1="12" x2="5" y2="12" {...props} />
        <Polyline points="12,19 5,12 12,5" {...props} />
      </>
    ),
    'arrow-right': (
      <>
        <Line x1="5" y1="12" x2="19" y2="12" {...props} />
        <Polyline points="12,5 19,12 12,19" {...props} />
      </>
    ),
    'arrow-lr': (
      <>
        <Polyline points="17,1 21,5 17,9" {...props} />
        <Path d="M3 11V9a4 4 0 0 1 4-4h14" {...props} />
        <Polyline points="7,23 3,19 7,15" {...props} />
        <Path d="M21 13v2a4 4 0 0 1-4 4H3" {...props} />
      </>
    ),
    copy: (
      <>
        <Rect x="9" y="9" width="13" height="13" rx="2" {...props} />
        <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" {...props} />
      </>
    ),
    camera: (
      <>
        <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" {...props} />
        <Circle cx="12" cy="13" r="4" {...props} />
      </>
    ),
    wifi: (
      <>
        <Path d="M5 12.55a11 11 0 0 1 14.08 0" {...props} />
        <Path d="M1.42 9a16 16 0 0 1 21.16 0" {...props} />
        <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" {...props} />
        <Line x1="12" y1="20" x2="12.01" y2="20" {...props} />
      </>
    ),
    logout: (
      <>
        <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" {...props} />
        <Polyline points="16,17 21,12 16,7" {...props} />
        <Line x1="21" y1="12" x2="9" y2="12" {...props} />
      </>
    ),
    'chevron-right': <Polyline points="9,18 15,12 9,6" {...props} />,
    'chevron-down': <Polyline points="6,9 12,15 18,9" {...props} />,
    projects: (
      <>
        <Rect x="2" y="3" width="20" height="14" rx="2" {...props} />
        <Line x1="8" y1="21" x2="16" y2="21" {...props} />
        <Line x1="12" y1="17" x2="12" y2="21" {...props} />
      </>
    ),
    token: (
      <>
        <Circle cx="12" cy="12" r="10" {...props} />
        <Path d="M12 8v4l3 3" {...props} />
      </>
    ),
    nfc: (
      <>
        <Path d="M6 3H3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h3" {...props} />
        <Path d="M14 3h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-3" {...props} />
        <Path d="M9 8l3 4-3 4" {...props} />
      </>
    ),
    refresh: (
      <>
        <Polyline points="23,4 23,10 17,10" {...props} />
        <Polyline points="1,20 1,14 7,14" {...props} />
        <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" {...props} />
      </>
    ),
    check: <Polyline points="20,6 9,17 4,12" {...props} />,
    bell: (
      <>
        <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" {...props} />
        <Path d="M13.73 21a2 2 0 0 1-3.46 0" {...props} />
      </>
    ),
    shield: (
      <>
        <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...props} />
      </>
    ),
    'check-circle': (
      <>
        <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" {...props} />
        <Polyline points="22,4 12,14.01 9,11.01" {...props} />
      </>
    ),
    clock: (
      <>
        <Circle cx="12" cy="12" r="10" {...props} />
        <Polyline points="12,6 12,12 16,14" {...props} />
      </>
    ),
    coin: (
      <>
        <Circle cx="12" cy="12" r="10" {...props} />
        <Path d="M9 9h1a2 2 0 0 1 0 4H9v2h3a2 2 0 0 1 0 4" {...props} />
        <Line x1="12" y1="7" x2="12" y2="9" {...props} />
        <Line x1="12" y1="17" x2="12" y2="19" {...props} />
      </>
    ),
    'arrow-up-right': (
      <>
        <Line x1="7" y1="17" x2="17" y2="7" {...props} />
        <Polyline points="7,7 17,7 17,17" {...props} />
      </>
    ),
    'wifi-off': (
      <>
        <Line x1="1" y1="1" x2="23" y2="23" {...props} />
        <Path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" {...props} />
        <Path d="M5 12.55a11 11 0 0 1 5.17-2.39" {...props} />
        <Path d="M10.71 5.05A16 16 0 0 1 22.56 9" {...props} />
        <Path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" {...props} />
        <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" {...props} />
        <Line x1="12" y1="20" x2="12.01" y2="20" {...props} />
      </>
    ),
    zap: <Polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" {...props} />,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {icons[name] ?? null}
    </Svg>
  );
};
