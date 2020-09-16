import { style } from 'sku/treat';

export const loader = style({
  color: '#f2f2f2',
  height: 300,
  width: 300,
  maxHeight: 'min(50vw, 50vh)',
  maxWidth: 'min(50vw, 50vh)',
});

export const panelDelay = style({
  transitionDelay: '1500ms',
});
