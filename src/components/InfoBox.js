import React from 'react';
import { Box, Text } from 'grommet';
import { StatusInfo, StatusGood, StatusWarning } from 'grommet-icons';
import QRCode from 'qrcode.react';

import styled from 'styled-components';

const InfoBox = ({ status, demoUrl }) => (
  <Box
    gap="medium"
    pad="medium"
    round="xsmall"
    elevation="small"
    background="white"
    animation={{ type: 'fadeIn', duration: 300 }}
  >
    <Box direction="row" gap="small" align="center">
      <Box>
        {status === 'busy' && <StatusInfo color="status-unknown" />}
        {status === 'ok' && <StatusGood color="status-ok" />}
        {status === 'error' && <StatusWarning color="status-unknown" />}
      </Box>
      <Text size="small">
        {status === 'busy' && 'Generating demo...'}
        {status === 'ok' && 'Demo ready!'}
        {status === 'error' && 'We cannot create a demo for that URL.'}
      </Text>
    </Box>
    <Box align="center">
      <Box width="128px" height="128px">
        <Opacity value={status === 'ok' ? 1 : 0.5}>
          <QRCode value={demoUrl || 'DEMO'} />
        </Opacity>
      </Box>
    </Box>
  </Box>
);

export default InfoBox;

const Opacity = styled.div`
  opacity: ${({ value = 1 }) => value};
`;
