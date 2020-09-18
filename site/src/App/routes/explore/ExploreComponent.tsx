import React, {
  Fragment,
  ReactNode,
  memo,
  useEffect,
  useState,
  useRef,
} from 'react';

import {
  Stack,
  Text,
  Heading,
  Box,
  Badge,
  Inline,
  Link,
  TextLink,
  Columns,
  Column,
  TextLinkButton,
  HiddenVisually,
} from '../../../../../lib/components';
import { getHistory } from '../../Updates';
import { ThemedExample } from '../../ThemeSetting';
import { documentedComponents } from '../../navigationHelpers';
import { chunk } from 'lodash';
import { CopyIcon } from '../../Code/CopyIcon';
import reactElementToJSXString from 'react-element-to-jsx-string';
import copy from 'copy-to-clipboard';
import { useIntersection } from 'react-use';
import { Overlay } from '../../../../../lib/components/private/Overlay/Overlay';

const noop = () => {};
const DefaultContainer = ({ children }: { children: ReactNode }) => (
  <Fragment>{children}</Fragment>
);

const explorableComponents = documentedComponents
  .filter(
    ({ category, deprecationWarning, explore }) =>
      category === 'Content' && !deprecationWarning && explore !== false,
  )
  .map(({ examples, ...rest }) => ({
    ...rest,
    examples: examples.filter(
      ({ docsSite, explore, Example }) =>
        Example && (explore || (docsSite !== false && explore !== false)),
    ),
  }));

const rowLength = Math.floor(Math.sqrt(explorableComponents.length)) * 2;
const exploreRows = chunk(explorableComponents, rowLength);

const ExampleMask = ({ children }: { children: ReactNode }) => {
  const elRef = useRef<HTMLElement | null>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const intersection = useIntersection(elRef, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  useEffect(() => {
    if (elRef.current) {
      setDimensions({
        w: elRef.current.scrollWidth,
        h: elRef.current.scrollHeight,
      });
    }
  }, []);

  const masked = Boolean(intersection && intersection.intersectionRatio < 1);

  return (
    <Box
      ref={elRef}
      position="relative"
      style={{
        height: dimensions.h > 0 ? dimensions.h : undefined,
        width: dimensions.w > 0 ? dimensions.w : undefined,
      }}
    >
      <Overlay
        background="body"
        borderRadius="standard"
        transition="fast"
        visible={masked}
      />
      <Box width="full" height="full">
        {masked ? null : children}
      </Box>
    </Box>
  );
};

const ExploreComponent = ({
  component,
}: {
  component: typeof explorableComponents[number];
}) => {
  const relevantNames = component.subComponents
    ? [component.name, ...component.subComponents]
    : [component.name];

  const history = getHistory(...relevantNames);
  const updateCount = history.filter((item) => item.isRecent).length;

  return (
    <Box padding="xxlarge" style={{ width: '800px' }}>
      <Stack space="xxlarge">
        <Inline space="small" alignY="top">
          <Heading level="2">
            <TextLink
              href={`/components/${component.name}`}
              target="explore-detail"
            >
              {component.name}
            </TextLink>
          </Heading>
          {updateCount > 0 ? (
            <Box
              component={Link}
              cursor="pointer"
              href={`/components/${component.name}/releases`}
              target="explore-detail"
            >
              <Badge
                tone="promote"
                weight="strong"
                title={`${updateCount} release${
                  updateCount === 1 ? '' : 's'
                } in the last two months`}
                bleedY
              >
                {String(updateCount)}
              </Badge>
            </Box>
          ) : undefined}
        </Inline>
        {component.examples.map(
          (
            {
              Example,
              Container = DefaultContainer,
              background = 'body',
              ...example
            },
            index,
          ) => {
            const codeAsString = Example
              ? reactElementToJSXString(
                  Example({ id: 'id', handler: noop }), // eslint-disable-line new-cap
                  {
                    useBooleanShorthandSyntax: false,
                    showDefaultProps: false,
                    showFunctions: false,
                    filterProps: ['onChange', 'onBlur', 'onFocus'],
                  },
                )
              : '';

            return (
              <Stack space="medium" key={`${example.label}_${index}`}>
                <Columns space="medium">
                  <Column>
                    <Text tone="secondary">{example.label}</Text>
                  </Column>
                  {codeAsString ? (
                    <Column width="content">
                      <Text tone="secondary">
                        <TextLinkButton
                          hitArea="large"
                          aria-describedby={`copy-${example.label}_${index}`}
                          onClick={() => copy(codeAsString)}
                        >
                          <CopyIcon />
                          <Box id={`copy-${example.label}_${index}`}>
                            <HiddenVisually>Copy to clipboard</HiddenVisually>
                          </Box>
                        </TextLinkButton>
                      </Text>
                    </Column>
                  ) : null}
                </Columns>
                {Example && (
                  <ThemedExample background={background}>
                    <ExampleMask>
                      <Container>
                        <Box style={{ cursor: 'auto' }}>
                          <Example
                            id={`${example.label}_${index}`}
                            handler={noop}
                          />
                        </Box>
                      </Container>
                    </ExampleMask>
                  </ThemedExample>
                )}
              </Stack>
            );
          },
        )}
      </Stack>
    </Box>
  );
};

export const ExploreRow = ({
  items,
}: {
  items: typeof explorableComponents;
}) => (
  <Columns space="xxlarge">
    {items.map((component) => (
      <Column key={component.name} width="content">
        <Box padding="xxlarge">
          <ExploreComponent component={component} />
        </Box>
      </Column>
    ))}
  </Columns>
);

export const Explore = memo(() => (
  <Box>
    {exploreRows.map((row, index) => (
      <ExploreRow items={row} key={index} />
    ))}
  </Box>
));
