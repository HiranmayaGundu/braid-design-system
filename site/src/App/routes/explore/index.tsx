import React, { useState, useEffect, useRef, useCallback } from 'react';
import panzoom from 'panzoom';

import { Page } from '../../../types';
import { PageTitle } from '../../Seo/PageTitle';
import {
  Text,
  Box,
  IconAdd,
  IconMinus,
  IconRefresh,
} from '../../../../../lib/components';
import { useThemeSettings, ThemeToggle } from '../../ThemeSetting';
import { Logo } from '../../Logo/Logo';
import { IconButton } from '../../../../../lib/components/iconButtons/IconButton';
import { useStyles } from 'sku/react-treat';
import { Explore } from './ExploreComponent';
import { ExplorePanel } from './ExplorePanel';
import * as styleRefs from './explore.treat';

const ExplorePage = () => {
  const styles = useStyles(styleRefs);
  const { ready: themeReady } = useThemeSettings();
  const [status, setStatus] = useState<'loading' | 'measuring' | 'done'>(
    'loading',
  );

  const contentRef = useRef<HTMLElement | null>(null);
  const panzoomRef = useRef<ReturnType<typeof panzoom> | null>(null);

  const [zoom, setZoom] = useState(1);
  const [initialView, setInitialView] = useState<{
    x: number;
    y: number;
    scale: number;
  } | null>(null);

  useEffect(() => {
    if (themeReady && initialView) {
      setStatus('done');

      const keyboardZoomHandler = (e: KeyboardEvent) => {
        const cmdOrCtrl = navigator.platform.match('Mac')
          ? e.metaKey
          : e.ctrlKey;

        const plus = e.keyCode === 187;
        const minus = e.keyCode === 189;

        if (cmdOrCtrl && (plus || minus)) {
          e.preventDefault();
          e.stopPropagation();

          if (plus) {
            zoomIn();
          }

          if (minus) {
            zoomOut();
          }
        }
      };

      document.addEventListener('keydown', keyboardZoomHandler);

      return () => {
        document.removeEventListener('keydown', keyboardZoomHandler);
      };
    }
  }, [themeReady, initialView]);

  const zoomOut = () => {
    if (panzoomRef.current) {
      panzoomRef.current.smoothZoom(
        document.documentElement.clientWidth / 2,
        document.documentElement.clientHeight / 2,
        0.5,
      );
    }
  };

  const zoomIn = () => {
    if (panzoomRef.current) {
      panzoomRef.current.smoothZoom(
        document.documentElement.clientWidth / 2,
        document.documentElement.clientHeight / 2,
        1.5,
      );
    }
  };

  const reset = useCallback(() => {
    if (panzoomRef.current && initialView) {
      panzoomRef.current.zoomAbs(0, 0, initialView.scale);
      panzoomRef.current.moveTo(initialView.x, initialView.y);
    }
  }, [initialView]);

  useEffect(() => {
    if (status !== 'loading' && contentRef.current) {
      const contentEl = contentRef.current;
      const screenBuffer = 0.005;
      const xScale =
        document.documentElement.clientWidth / contentEl.scrollWidth;
      const yScale =
        document.documentElement.clientHeight / contentEl.scrollHeight;
      const initialScale = Math.min(xScale, yScale) - screenBuffer;
      const initialX =
        (document.documentElement.clientWidth -
          contentEl.scrollWidth * initialScale) /
        2;
      const initialY =
        (document.documentElement.clientHeight -
          contentEl.scrollHeight * initialScale) /
        2;

      panzoomRef.current = panzoom(contentEl, {
        maxZoom: 20,
        minZoom: initialScale,
        zoomDoubleClickSpeed: 1,
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

      panzoomRef.current.zoomAbs(initialX, initialY, initialScale);

      setInitialView({ x: initialX, y: initialY, scale: initialScale });

      return () => {
        panzoomRef.current?.dispose();
      };
    }
  }, [status]);

  useEffect(() => {
    setTimeout(() => {
      setStatus('measuring');
    }, 500);
  }, []);

  return (
    <Box position="fixed" top={0} bottom={0} left={0} right={0}>
      <PageTitle title="Explore" />

      {/* Components */}
      {status !== 'loading' ? (
        <Box
          transition="fast"
          opacity={status === 'done' ? undefined : 0}
          style={{ cursor: 'move' }}
        >
          <Box ref={contentRef} userSelect="none">
            <Explore />
          </Box>
        </Box>
      ) : null}

      <ExplorePanel bottom right show={status === 'done'}>
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
      </ExplorePanel>

      <ExplorePanel top right show={status === 'done'}>
        <ThemeToggle size="small" weight="regular" />
      </ExplorePanel>

      {/* Loader */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="full"
        width="full"
        zIndex="modal"
        opacity={status !== 'done' ? 0 : undefined}
        pointerEvents={status !== 'done' ? 'none' : undefined}
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
