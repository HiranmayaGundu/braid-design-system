import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useReducer,
} from 'react';
import panzoom from '@panzoom/panzoom';

import { Page } from '../../../types';
import { PageTitle } from '../../Seo/PageTitle';
import {
  Text,
  Box,
  Inline,
  IconAdd,
  IconMinus,
  IconLocation,
  IconLanguage,
  IconRefresh,
} from '../../../../../lib/components';
import { useThemeSettings } from '../../ThemeSetting';
import { Logo } from '../../Logo/Logo';
import { IconButton } from '../../../../../lib/components/iconButtons/IconButton';
import { useStyles } from 'sku/react-treat';
import { exploreRows, ExploreRow } from './ExploreComponent';
import { ExplorePanel } from './ExplorePanel';
import * as styleRefs from './explore.treat';
import { pointSize } from './exploreMapPointSize';
import { throttle } from 'lodash';

interface State {
  ready: boolean;
  scale: number;
  mapPosX: number;
  mapPosY: number;
  focalPointOffsetX: number;
  focalPointOffsetY: number;
  mapScale: number;
  mapHeight: number;
  mapWidth: number;
  width: number;
  height: number;
}

type Action =
  | {
      type: 'INITIALISE';
      payload: {
        width: number;
        height: number;
      };
    }
  | { type: 'PAN'; payload: { x: number; y: number } }
  | { type: 'RESET' }
  | { type: 'ZOOM_WHEEL'; payload: { scale: number; x: number; y: number } }
  | { type: 'ZOOM_IN'; payload: { scale: number; x: number; y: number } }
  | { type: 'ZOOM_OUT'; payload: { scale: number; x: number; y: number } };

const initialState: State = {
  ready: false,
  scale: 1,
  mapPosX: 0,
  mapPosY: 0,
  focalPointOffsetX: 0,
  focalPointOffsetY: 0,
  mapScale: 1,
  mapHeight: 0,
  mapWidth: 0,
  width: 0,
  height: 0,
};

const MAP_EDGE_TRESHOLD = 8;
const MAP_SIZE = 200;

const reducer = (state: State, action: Action): State => {
  console.log(action);
  switch (action.type) {
    case 'INITIALISE': {
      const { width, height } = action.payload;

      const isWide = width > height;
      const mapScale = MAP_SIZE / (isWide ? width : height);
      const mapWidth = isWide ? MAP_SIZE : width * mapScale;
      const mapHeight = isWide ? height * mapScale : MAP_SIZE;

      return {
        ...state,
        width,
        height,
        focalPointOffsetX: width / 2,
        focalPointOffsetY: height / 2,
        mapPosX: (width * mapScale) / 2,
        mapPosY: (height * mapScale) / 2,
        mapScale,
        mapHeight,
        mapWidth,
      };
    }
    case 'RESET': {
      return {
        ...state,
        mapPosX: state.focalPointOffsetX * state.mapScale,
        mapPosY: state.focalPointOffsetY * state.mapScale,
        scale: 1,
      };
    }
    case 'PAN': {
      const { x, y } = action.payload;

      return {
        ...state,
        mapPosX: (state.focalPointOffsetX - x) * state.mapScale,
        mapPosY: (state.focalPointOffsetY - y) * state.mapScale,
      };
    }
    case 'ZOOM_WHEEL':
    case 'ZOOM_IN':
    case 'ZOOM_OUT':
      const { x, y } = action.payload;

      return {
        ...state,
        scale: action.payload.scale,
        mapPosX: (state.focalPointOffsetX - x) * state.mapScale,
        mapPosY: (state.focalPointOffsetY - y) * state.mapScale,
      };
    default:
      return state;
  }
};

interface PanEvent extends Event {
  detail: {
    x: number;
    y: number;
  };
}

const Explore = () => {
  const styles = useStyles(styleRefs);
  const contentRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const panzoomRef = useRef<ReturnType<typeof panzoom> | null>(null);

  const { ready: themeReady } = useThemeSettings();
  // const [startRendering, setStartRendering] = useState(false);
  const [startRendering, setStartRendering] = useState(true);
  const exploreReady = themeReady && startRendering;

  const [state, dispatch] = useReducer(reducer, initialState);

  const reset = useCallback(() => {
    if (panzoomRef.current) {
      panzoomRef.current.reset();
      dispatch({ type: 'RESET' });
    }
  }, [panzoomRef]);

  const zoomIn = useCallback(() => {
    if (panzoomRef.current) {
      const { scale, x, y } = panzoomRef.current.zoomIn();

      dispatch({
        type: 'ZOOM_IN',
        payload: { scale, x, y },
      });
    }
  }, [panzoomRef]);

  const zoomOut = useCallback(() => {
    if (panzoomRef.current) {
      const { scale, x, y } = panzoomRef.current.zoomOut();

      dispatch({
        type: 'ZOOM_OUT',
        payload: { scale, x, y },
      });
    }
  }, [panzoomRef]);

  // const throttledDispatch = useCallback(
  //   throttle((a: Action) => dispatch(a), 300, { trailing: true }),
  //   [dispatch],
  // );

  useEffect(() => {
    if (containerRef.current && contentRef.current && startRendering) {
      const containerElement = containerRef.current;
      const contentElement = contentRef.current;

      panzoomRef.current = panzoom(contentElement, {
        canvas: true,
      });

      dispatch({
        type: 'INITIALISE',
        payload: {
          width: contentElement.scrollWidth,
          height: contentElement.scrollHeight,
        },
      });

      const zoomWheel = (e: WheelEvent) => {
        const cmdOrCtrl = navigator.platform.match('Mac')
          ? e.metaKey
          : e.ctrlKey;

        if (!cmdOrCtrl || !panzoomRef.current) {
          return;
        }

        const { scale, x, y } = panzoomRef.current.zoomWithWheel(e);

        dispatch({
          type: 'ZOOM_WHEEL',
          payload: {
            scale,
            x,
            y,
          },
        });
      };

      const updateMapLocation = (event: Event) => {
        const { detail } = event as PanEvent;

        dispatch({
          type: 'PAN',
          payload: {
            x: detail.x,
            y: detail.y,
          },
        });
      };

      containerElement.addEventListener('wheel', zoomWheel);
      contentElement.addEventListener('panzoomend', updateMapLocation);

      return () => {
        containerElement.removeEventListener('wheel', zoomWheel);
        contentElement.removeEventListener('panzoomend', updateMapLocation);
      };
    }
  }, [startRendering]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setStartRendering(true);
  //   }, 500);
  // }, []);

  const { mapWidth, mapHeight, mapPosX, mapPosY } = state;

  const minX = MAP_EDGE_TRESHOLD + pointSize / 2;
  const maxX = mapWidth - MAP_EDGE_TRESHOLD - pointSize / 2;

  const minY = MAP_EDGE_TRESHOLD;
  const maxY = mapHeight - MAP_EDGE_TRESHOLD;

  return (
    <Box position="fixed" top={0} bottom={0} left={0} right={0}>
      {/* Components */}
      {startRendering ? (
        <Box
          ref={containerRef}
          transition="fast"
          opacity={themeReady ? undefined : 0}
        >
          <Box ref={contentRef}>
            <PageTitle title="Explore" />
            <Box style={{ width: '100vw', height: '100vh' }}>
              <IconLanguage size="fill" />
            </Box>
            {/* {exploreRows.map((row, index) => (
              <ExploreRow items={row} key={index} />
            ))} */}
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
          <Logo iconOnly height="100%" width="100%" />
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
                {Math.round(state.scale * 100)}%
              </Text>
              <IconButton label="Zoom In" onClick={zoomIn} keyboardAccessible>
                {(iconProps) => <IconAdd {...iconProps} />}
              </IconButton>
            </Inline>
          </Box>
        </ExplorePanel>

        <ExplorePanel bottom left height={mapHeight} width={mapWidth}>
          <Box
            position="absolute"
            transition="fast"
            style={{
              transform: `translate(
                clamp(${minX}px, ${mapPosX}px, ${maxX}px),
                clamp(${minY}px, ${mapPosY}px, ${maxY}px)
              )`,
            }}
          >
            <Box position="absolute" className={styles.locationPin}>
              <IconLocation tone="formAccent" size="small" />
            </Box>
            <Box
              position="relative"
              background="formAccent"
              borderRadius="full"
              zIndex={0}
              className={styles.locationPoint}
            />
          </Box>
        </ExplorePanel>
      </Box>
    </Box>
  );
};

const page: Page = {
  title: 'Explore',
  exact: true,
  component: Explore,
};

export default {
  '/explore': page,
};
