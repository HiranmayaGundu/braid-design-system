import React, { Fragment, ReactNode } from 'react';

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
} from '../../../../../lib/components';
import { getHistory } from '../../Updates';
import { ThemedExample } from '../../ThemeSetting';
import { documentedComponents } from '../../navigationHelpers';
import { chunk } from 'lodash';

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
export const exploreRows = chunk(explorableComponents, rowLength);

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
            <TextLink href={`/components/${component.name}`}>
              {component.name}
            </TextLink>
          </Heading>
          {updateCount > 0 ? (
            <Box
              component={Link}
              cursor="pointer"
              href={`/components/${component.name}/releases`}
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
          ) => (
            <Stack space="medium" key={`${example.label}_${index}`}>
              <Text tone="secondary">{example.label}</Text>
              {Example && (
                <ThemedExample background={background}>
                  <Container>
                    <Example id={`${example.label}_${index}`} handler={noop} />
                  </Container>
                </ThemedExample>
              )}
            </Stack>
          ),
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
