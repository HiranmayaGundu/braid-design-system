import { style } from 'sku/treat';

export const svg = style({
  fill: 'none',
});

export const draw = style({
  strokeDasharray: 250,
  strokeDashoffset: 250,
  strokeLinecap: 'round',
  strokeWidth: '2px',
  stroke: 'currentColor',
  '@keyframes': {
    '20%,70%': {
      strokeDashoffset: 0,
    },
    '90%,100%': {
      strokeDashoffset: -250,
    },
  },
  animationTimingFunction: 'ease-in-out',
  animationDuration: '2500ms',
  animationIterationCount: 'infinite',
});
