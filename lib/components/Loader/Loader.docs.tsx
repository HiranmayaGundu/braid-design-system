import React, { Fragment } from 'react';
import { ComponentDocs } from '../../../site/src/types';
import { background as boxBackgrounds } from '../Box/useBoxStyles.treat';
import { Box, Loader } from '../';

const docs: ComponentDocs = {
  category: 'Content',
  screenshotWidths: [320],
  examples: [
    {
      label: 'Default',
      Example: () => <Loader />,
    },
    {
      label: 'Delay visibility (used to prevent loading flicker)',
      explore: false,
      Example: () => <Loader delayVisibility />,
    },
    {
      label: 'xsmall',
      explore: false,
      Example: () => <Loader size="xsmall" />,
    },
    {
      label: 'small',
      explore: false,
      Example: () => <Loader size="small" />,
    },
    {
      label: 'standard',
      explore: false,
      Example: () => <Loader size="standard" />,
    },
    {
      label: 'large',
      explore: false,
      Example: () => <Loader size="large" />,
    },
    {
      label: 'Loader Contrast',
      docsSite: false,
      explore: false,
      Example: () => {
        const backgrounds = Object.keys(boxBackgrounds) as Array<
          keyof typeof boxBackgrounds
        >;

        return (
          <Fragment>
            {backgrounds.sort().map((background) => (
              <Box key={background} background={background} padding="xsmall">
                <Loader />
              </Box>
            ))}
          </Fragment>
        );
      },
    },
  ],
  snippets: [{ name: 'Standard', code: <Loader /> }],
};

export default docs;
