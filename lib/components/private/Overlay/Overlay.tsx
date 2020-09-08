import React from 'react';
import { Box, BoxProps } from '../../Box/Box';
import { hideFocusRingsClassName } from '../hideFocusRings/hideFocusRings';

export interface OverlayProps
  extends Partial<
    Pick<
      BoxProps,
      | 'children'
      | 'zIndex'
      | 'background'
      | 'borderRadius'
      | 'boxShadow'
      | 'transition'
      | 'className'
    >
  > {
  visible?: boolean;
  onlyVisibleForKeyboardNavigation?: boolean;
}

export const Overlay = ({
  zIndex,
  background,
  borderRadius,
  boxShadow,
  transition,
  visible = false,
  onlyVisibleForKeyboardNavigation = false,
  className,
  children,
  style,
}: OverlayProps) => (
  <Box
    position="absolute"
    zIndex={zIndex}
    pointerEvents="none"
    background={background}
    borderRadius={borderRadius}
    boxShadow={boxShadow}
    transition={transition}
    top={0}
    bottom={0}
    left={0}
    right={0}
    opacity={!visible ? 0 : undefined}
    className={[
      onlyVisibleForKeyboardNavigation ? hideFocusRingsClassName : null,
      className,
    ]}
    style={style}
  >
    {children}
  </Box>
);
