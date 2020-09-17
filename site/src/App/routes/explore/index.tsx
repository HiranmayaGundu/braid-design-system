import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import { Page } from '../../../types';
import { PageTitle } from '../../Seo/PageTitle';
import {
  Text,
  Box,
  Inline,
  IconAdd,
  IconMinus,
  IconRefresh,
  // IconLocation,
  // IconLanguage,
} from '../../../../../lib/components';
import { useThemeSettings } from '../../ThemeSetting';
import { Logo } from '../../Logo/Logo';
import { IconButton } from '../../../../../lib/components/iconButtons/IconButton';
import { useStyles } from 'sku/react-treat';
import { Explore } from './ExploreComponent';
import { ExplorePanel } from './ExplorePanel';
import * as styleRefs from './explore.treat';

const ExplorePage = () => {
  const styles = useStyles(styleRefs);
  const { ready: themeReady } = useThemeSettings();
  const [startRendering, setStartRendering] = useState(false);
  const exploreReady = themeReady && startRendering;

  useEffect(() => {
    setTimeout(() => {
      setStartRendering(true);
    }, 500);
  }, []);

  return (
    <Box position="fixed" top={0} bottom={0} left={0} right={0}>
      <PageTitle title="Explore" />

      {/* Components */}
      {startRendering ? (
        <Box
          transition="fast"
          opacity={themeReady ? undefined : 0}
          style={{ cursor: 'move' }}
        >
          <TransformWrapper
            options={{
              minScale: 0.1,
              limitToBounds: false,
              // minPositionX: PAN_THRESHOLD,
              // maxPositionX: contentWidth + PAN_THRESHOLD,

              // limitToWrapper: true,
            }}
            zoomIn={{ step: 5 }}
            zoomOut={{ step: 5 }}
            pan={{ velocity: true }}
            wheel={{ step: 300 }}
            doubleClick={{ disabled: true }}
          >
            {/* @ts-expect-error */}
            {({ zoomIn, zoomOut, resetTransform, scale: zoom }) => (
              <>
                <TransformComponent>
                  {/* <Box
                    style={{ height: 4000, width: 4000 }}
                    position="relative"
                  >
                    <IconLanguage size="fill" />
                  </Box> */}
                  <Explore />
                </TransformComponent>
                <Box
                  transition="fast"
                  opacity={!exploreReady ? 0 : undefined}
                  className={styles.panelDelay}
                >
                  <ExplorePanel bottom right>
                    <Box paddingY="small" paddingX="gutter">
                      <Inline space="small" alignY="center">
                        <IconButton
                          label="Reset"
                          onClick={resetTransform}
                          keyboardAccessible
                        >
                          {(iconProps) => <IconRefresh {...iconProps} />}
                        </IconButton>
                        <IconButton
                          label="Zoom Out"
                          onClick={zoomOut}
                          keyboardAccessible
                        >
                          {(iconProps) => <IconMinus {...iconProps} />}
                        </IconButton>
                        <Text size="small" tone="secondary">
                          {Math.round(zoom * 100)}%
                        </Text>
                        <IconButton
                          label="Zoom In"
                          onClick={zoomIn}
                          keyboardAccessible
                        >
                          {(iconProps) => <IconAdd {...iconProps} />}
                        </IconButton>
                      </Inline>
                    </Box>
                  </ExplorePanel>
                </Box>
              </>
            )}
          </TransformWrapper>
        </Box>
      ) : null}

      {/* Loader */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="full"
        width="full"
        zIndex="modal"
        opacity={exploreReady ? 0 : undefined}
        pointerEvents={exploreReady ? 'none' : undefined}
      >
        <Box className={styles.loader}>
          <Logo iconOnly draw height="100%" width="100%" />
        </Box>
      </Box>
    </Box>
  );
};

const page: Page = {
  title: 'Explore',
  exact: true,
  component: ExplorePage,
};

export default {
  '/explore': page,
};
