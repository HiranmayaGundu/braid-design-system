import React, { ReactNode } from 'react';
import { Box } from '../../../../../lib/components';

export const ExplorePanel = ({
  children,
  bottom,
  left,
  right,
  top,
}: {
  children: ReactNode;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  top?: boolean;
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
    style={{
      boxShadow: '0 2px 5px 1px rgba(28,28,28,.2)',
    }}
  >
    {children}
  </Box>
);
