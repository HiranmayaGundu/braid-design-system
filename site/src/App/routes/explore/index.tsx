import React, { useState, useEffect, useRef } from 'react';
import panzoom from 'panzoom';

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

  const contentRef = useRef<HTMLElement | null>(null);
  const panzoomRef = useRef<ReturnType<typeof panzoom> | null>(null);
  const [zoom, setZoom] = useState(1);

  const zoomOut = () => {
    if (panzoomRef.current) {
      panzoomRef.current.smoothZoom(
        document.documentElement.clientWidth / 2,
        document.documentElement.clientHeight / 2,
        0.75,
      );
    }
  };

  const zoomIn = () => {
    if (panzoomRef.current) {
      panzoomRef.current.smoothZoom(
        document.documentElement.clientWidth / 2,
        document.documentElement.clientHeight / 2,
        1.25,
      );
    }
  };

  const reset = () => {
    if (panzoomRef.current) {
      panzoomRef.current.zoomAbs(
        document.documentElement.clientWidth / 2,
        document.documentElement.clientHeight / 2,
        1,
      );
      const { x, y } = panzoomRef.current.getTransform();
      panzoomRef.current.moveBy(-x, -y, true);
    }
  };

  useEffect(() => {
    if (startRendering && contentRef.current) {
      panzoomRef.current = panzoom(contentRef.current, {
        maxZoom: 20,
        minZoom: 0.1,
        zoomDoubleClickSpeed: 1,
        beforeWheel(e) {
          const isTrackpad = e.deltaY % 1 !== 0;
          const cmdOrCtrl = navigator.platform.match('Mac')
            ? e.metaKey
            : e.ctrlKey;

          return !(cmdOrCtrl || isTrackpad);
        },
        beforeMouseDown: (e) =>
          // @ts-expect-error
          /^(a|input|button)$/i.test(e.target.tagName) ||
          // @ts-expect-error
          e.target.getAttribute('role') === 'button',
      });

      panzoomRef.current.on('zoom', () => {
        if (panzoomRef.current) {
          setZoom(panzoomRef.current.getTransform().scale);
        }
      });

      return () => {
        panzoomRef.current?.dispose();
      };
    }
  }, [startRendering]);

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
          <Box ref={contentRef} userSelect="none">
            <Explore />
          </Box>
        </Box>
      ) : null}

      <Box
        transition="fast"
        opacity={!exploreReady ? 0 : undefined}
        className={styles.panelDelay}
      >
        <ExplorePanel bottom right>
          <Box paddingY="small" paddingX="gutter">
            <Inline space="small" alignY="center">
              <IconButton label="Reset" onClick={reset} keyboardAccessible>
                {(iconProps) => <IconRefresh {...iconProps} />}
              </IconButton>
              <IconButton label="Zoom Out" onClick={zoomOut} keyboardAccessible>
                {(iconProps) => <IconMinus {...iconProps} />}
              </IconButton>
              <Text size="small" tone="secondary">
                {Math.round(zoom * 100)}%
              </Text>
              <IconButton label="Zoom In" onClick={zoomIn} keyboardAccessible>
                {(iconProps) => <IconAdd {...iconProps} />}
              </IconButton>
            </Inline>
          </Box>
        </ExplorePanel>
      </Box>

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
