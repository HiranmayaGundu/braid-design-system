import { style, globalStyle } from 'sku/treat';
import { pointSize } from './exploreMapPointSize';

export const locationPoint = style({
  height: pointSize,
  width: pointSize * 2,
  transform: 'translate(-50%, -50%)',
  opacity: 0.3,
});

export const locationPin = style(({ typography, grid }) => {
  const iconSize = typography.text.small.mobile.rows * grid;

  return {
    transform: `translate(-${pointSize * 2}px, -${iconSize + pointSize / 2}px)`,
  };
});

export const loader = style({
  color: '#e0e0e0',
  height: 300,
  width: 300,
  maxHeight: 'min(50vw, 50vh)',
  maxWidth: 'min(50vw, 50vh)',
});

export const panelDelay = style({
  transitionDelay: '1500ms',
});

globalStyle(`${loader} path`, {
  strokeDasharray: 150,
  strokeLinecap: 'round',
  strokeWidth: '2px',
  stroke: 'currentColor',
  '@keyframes': {
    to: {
      strokeDasharray: 1200,
    },
  },
  animationTimingFunction: 'linear',
  animationDuration: '1.5s',
});

globalStyle(`${loader} svg`, {
  fill: 'none',
});
