import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export type IconProps = {
  size?: number;
  color?: string;
  sw?: number;
};

function Base({ size = 22, color = '#000', sw = 1.6, children }: IconProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export const IcInbox = (p: IconProps) => (
  <Base {...p}>
    <Path d="M3 13l3-8h12l3 8" />
    <Path d="M3 13v6h18v-6" />
    <Path d="M3 13h5l1 2h6l1-2h5" />
  </Base>
);

export const IcTag = (p: IconProps) => (
  <Base {...p}>
    <Path d="M3 11l8-8h8v8l-8 8z" />
    <Circle cx="15.5" cy="7.5" r="1.2" />
  </Base>
);

export const IcSearch = (p: IconProps) => (
  <Base {...p}>
    <Circle cx="11" cy="11" r="6.5" />
    <Path d="M20 20l-4.2-4.2" />
  </Base>
);

export const IcGear = (p: IconProps) => (
  <Base {...p}>
    <Circle cx="12" cy="12" r="3.2" />
    <Path d="M19.4 14.6a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.1 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7 4.1l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.9 7l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Base>
);

export const IcBack = (p: IconProps) => (
  <Base {...p}>
    <Path d="M15 5l-7 7 7 7" />
  </Base>
);

export const IcAdd = (p: IconProps) => (
  <Base {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Base>
);

export const IcGrid = (p: IconProps) => (
  <Base {...p}>
    <Rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
    <Rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
    <Rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
    <Rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
  </Base>
);

export const IcRows = (p: IconProps) => (
  <Base {...p}>
    <Path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const IcFilter = (p: IconProps) => (
  <Base {...p}>
    <Path d="M3 5h18M6 12h12M10 19h4" />
  </Base>
);

export const IcDots = ({ size = 22, color = '#000', sw = 1.6 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={sw}>
    <Circle cx="5" cy="12" r="1.3" fill={color} stroke="none" />
    <Circle cx="12" cy="12" r="1.3" fill={color} stroke="none" />
    <Circle cx="19" cy="12" r="1.3" fill={color} stroke="none" />
  </Svg>
);

export const IcStar = (p: IconProps) => (
  <Base {...p}>
    <Path d="M12 4l2.5 5 5.5.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.5-.8z" />
  </Base>
);

export const IcCheck = (p: IconProps) => (
  <Base {...p}>
    <Path d="M5 12.5l4.5 4.5L19 7" />
  </Base>
);

export const IcClock = (p: IconProps) => (
  <Base {...p}>
    <Circle cx="12" cy="12" r="8.5" />
    <Path d="M12 7v5l3 2" />
  </Base>
);

export const IcText = (p: IconProps) => (
  <Base {...p}>
    <Path d="M5 8V6h14v2M9 19h6M12 6v13" />
  </Base>
);

export const IcSun = (p: IconProps) => (
  <Base {...p}>
    <Circle cx="12" cy="12" r="3.5" />
    <Path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7" />
  </Base>
);

export const IcMoon = (p: IconProps) => (
  <Base {...p}>
    <Path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </Base>
);

export const IcSpeaker = (p: IconProps) => (
  <Base {...p}>
    <Path d="M5 9v6h3l5 4V5L8 9z" />
    <Path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
  </Base>
);

export const IcHighlight = (p: IconProps) => (
  <Base {...p}>
    <Path d="M5 16l-1 4 4-1 9.5-9.5-3-3z" />
    <Path d="M14 6.5l3 3" />
  </Base>
);

export const IcNote = (p: IconProps) => (
  <Base {...p}>
    <Path d="M4 5h16v11l-5 5H4z" />
    <Path d="M15 21v-5h5" />
    <Path d="M8 9h8M8 13h6" />
  </Base>
);

export const IcLink = (p: IconProps) => (
  <Base {...p}>
    <Path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4" />
    <Path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4" />
  </Base>
);

export const IcShare = (p: IconProps) => (
  <Base {...p}>
    <Path d="M12 4v11" />
    <Path d="M8 8l4-4 4 4" />
    <Path d="M5 14v5h14v-5" />
  </Base>
);

export const IcArchive = (p: IconProps) => (
  <Base {...p}>
    <Rect x="3.5" y="4.5" width="17" height="4" rx="1" />
    <Path d="M5 8.5V19h14V8.5" />
    <Path d="M10 12h4" />
  </Base>
);

export const IcEye = (p: IconProps) => (
  <Base {...p}>
    <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <Circle cx="12" cy="12" r="3" />
  </Base>
);

export const IcX = (p: IconProps) => (
  <Base {...p}>
    <Path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const IcAa = ({ size = 22, color = '#000', sw = 1.5 }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M3 19l4-12 4 12M4.5 15h5" />
    <Path d="M14 14a3 3 0 1 0 6 0c0-2-1.5-3-3-3s-3 1-3 3z" />
  </Svg>
);
