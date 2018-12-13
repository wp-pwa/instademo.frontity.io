import React from 'react';
import { Box, Stack } from 'grommet';
import { InProgress } from 'grommet-icons';
import styled from 'styled-components';

const Demo = ({
  status,
  src,
  width = '360px',
  height = '640px',
  withFrame = false,
}) => (
  <Box
    background={{ color: 'brand' }}
    gap="large"
    round={withFrame ? 'large' : 'xsmall'}
    align="center"
    justify="center"
    elevation="large"
    overflow="hidden"
  >
    <Box
      width={width}
      height={height}
      margin={
        withFrame
          ? {
              horizontal: '16px',
              vertical: '64px',
            }
          : {}
      }
      background={{ color: 'light-1' }}
    >
      <Stack>
        <Box width={width} height={height} align="center" justify="center">
          {status === 'ok' && (
            <Box animation="fadeIn">
              <InProgress size="large" color="brand" />
            </Box>
          )}
        </Box>
        <Box width={width} height={height}>
          <Iframe src={status === 'ok' ? src : ''} />
        </Box>
      </Stack>
    </Box>
  </Box>
);

const Iframe = styled.iframe`
  margin: 0;
  padding: 0;
  border: none;
  width: 100%;
  height: 100%;
`;

export default Demo;
