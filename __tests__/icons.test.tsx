import React from 'react';
import { render } from '@testing-library/react-native';
import {
  IcInbox, IcTag, IcSearch, IcGear, IcBack, IcAdd, IcGrid, IcRows,
  IcFilter, IcDots, IcStar, IcCheck, IcClock, IcText, IcSun, IcMoon,
  IcSpeaker, IcHighlight, IcNote, IcLink, IcShare, IcArchive, IcEye,
  IcX, IcAa,
} from '../components/icons';

const ALL_ICONS = [
  IcInbox, IcTag, IcSearch, IcGear, IcBack, IcAdd, IcGrid, IcRows,
  IcFilter, IcDots, IcStar, IcCheck, IcClock, IcText, IcSun, IcMoon,
  IcSpeaker, IcHighlight, IcNote, IcLink, IcShare, IcArchive, IcEye,
  IcX, IcAa,
];

const SIZES = [16, 18, 20, 22];

describe('icons', () => {
  it.each(ALL_ICONS.map(Icon => [Icon.name, Icon]))(
    '%s renders at all required sizes without error',
    (_, Icon: React.ComponentType<{ size: number }>) => {
      SIZES.forEach(size => {
        expect(() => render(<Icon size={size} color="#000" />)).not.toThrow();
      });
    }
  );

  it('all 25 icons are exported', () => {
    expect(ALL_ICONS).toHaveLength(25);
  });
});
