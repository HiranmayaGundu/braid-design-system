import React from 'react';
import { Box, Inline } from '../../../../../lib/components';
import { ReactNodeNoStrings } from '../../../../../lib/components/private/ReactNodeNoStrings';

export const ExplorePanel = ({
  children,
  bottom,
  left,
  right,
  top,
  show = true,
}: {
  children: ReactNodeNoStrings;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  top?: boolean;
  show?: boolean;
}) => (
  <Box
    position="fixed"
    margin="small"
    borderRadius="standard"
    background="card"
    bottom={bottom ? 0 : undefined}
    left={left ? 0 : undefined}
    right={right ? 0 : undefined}
    top={top ? 0 : undefined}
    transition="fast"
    opacity={show ? undefined : 0}
    display="flex"
    alignItems="center"
    height="touchable"
    paddingX={['small', 'gutter']}
    style={{
      boxShadow: '0 2px 5px 1px rgba(28,28,28,.2)',
      transitionDelay: '1500ms',
    }}
  >
    <Inline space="small" alignY="center">
      {children}
    </Inline>
  </Box>
);
