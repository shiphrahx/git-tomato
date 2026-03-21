import React from 'react';
import tomato1 from '../assets/tomato-1.png';
import tomato2 from '../assets/tomato-2.png';
import tomato3 from '../assets/tomato-3.png';
import tomato4 from '../assets/tomato-4.png';
import tomato5 from '../assets/tomato-5.png';

const IMAGES = { 1: tomato1, 2: tomato2, 3: tomato3, 4: tomato4, 5: tomato5 };

export function getTomatoState(progress) {
  if (progress > 0.8) return 1;
  if (progress > 0.6) return 2;
  if (progress > 0.4) return 3;
  if (progress > 0.2) return 4;
  return 5;
}

export function TomatoSprite({ state = 1 }) {
  return (
    <img
      src={IMAGES[state] ?? IMAGES[1]}
      alt=""
      width={140}
      height={140}
      style={{ imageRendering: 'pixelated', display: 'block' }}
      draggable={false}
    />
  );
}
