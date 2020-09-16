import React, { useState, useEffect, useRef, useCallback } from 'react';
import panzoom from '@panzoom/panzoom';

import { Page } from '../../../types';
import { PageTitle } from '../../Seo/PageTitle';
import {
  Text,
  Box,
  Inline,
  IconAdd,
  IconMinus,
  IconRefresh,
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
  const contentRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const panzoomRef = useRef<ReturnType<typeof panzoom> | null>(null);

  const [zoom, setZoom] = useState(1);
  const { ready: themeReady } = useThemeSettings();
  const [startRendering, setStartRendering] = useState(false);
  const exploreReady = themeReady && startRendering;

  const reset = useCallback(() => {
    if (panzoomRef.current) {
      panzoomRef.current.reset();
      setZoom(1);
    }
  }, [panzoomRef]);

  const zoomIn = useCallback(() => {
    if (panzoomRef.current && contentRef.current && containerRef.current) {
      const scale = panzoomRef.current.getScale();
      const { width, height } = contentRef.current.getBoundingClientRect();
      const {
        width: parentWidth,
        height: parentHeight,
      } = containerRef.current.getBoundingClientRect();

      const halfWidth = document.documentElement.clientWidth / 2;
      const halfHeight = document.documentElement.clientHeight / 2;

      const clientX = halfWidth - width / scale / 2;
      const clientY = halfHeight - height / scale / 2;

      const toScale = scale * Math.exp(1 * 0.3);

      panzoomRef.current.zoomIn({
        animate: false,
        focal: {
          x: (clientX / parentWidth) * (parentWidth * toScale),
          y: (clientY / parentHeight) * (parentHeight * toScale),
        },
      });
    }
  }, [panzoomRef]);

  const zoomOut = useCallback(() => {
    if (panzoomRef.current && contentRef.current && containerRef.current) {
      const scale = panzoomRef.current.getScale();
      const { width, height } = contentRef.current.getBoundingClientRect();
      const {
        width: parentWidth,
        height: parentHeight,
      } = containerRef.current.getBoundingClientRect();

      const halfWidth = document.documentElement.clientWidth / 2;
      const halfHeight = document.documentElement.clientHeight / 2;

      const clientX = halfWidth - width / scale / 2;
      const clientY = halfHeight - height / scale / 2;

      const toScale = scale * Math.exp(-1 * 0.3);

      panzoomRef.current.zoomOut({
        animate: false,
        focal: {
          x: (clientX / parentWidth) * (parentWidth * toScale),
          y: (clientY / parentHeight) * (parentHeight * toScale),
        },
      });
    }
  }, [panzoomRef]);

  useEffect(() => {
    if (containerRef.current && contentRef.current && startRendering) {
      const containerElement = containerRef.current;
      const contentElement = contentRef.current;

      panzoomRef.current = panzoom(contentElement, {
        canvas: true,
      });

      const zoomWheel = (e: WheelEvent) => {
        const cmdOrCtrl = navigator.platform.match('Mac')
          ? e.metaKey
          : e.ctrlKey;

        if (!cmdOrCtrl || !panzoomRef.current) {
          return;
        }

        panzoomRef.current.zoomWithWheel(e);
      };

      const updateZoom = () => {
        if (panzoomRef.current) {
          setZoom(panzoomRef.current.getScale());
        }
      };

      containerElement.addEventListener('wheel', zoomWheel);
      contentElement.addEventListener('panzoomzoom', updateZoom);

      return () => {
        containerElement.removeEventListener('wheel', zoomWheel);
        contentElement.removeEventListener('panzoomzoom', updateZoom);
        panzoomRef.current?.destroy();
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
          ref={containerRef}
          transition="fast"
          opacity={themeReady ? undefined : 0}
        >
          <Box ref={contentRef}>
            <Explore />
          </Box>
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

      {/* Panel overlays */}
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
