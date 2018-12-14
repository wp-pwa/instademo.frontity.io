import React from 'react';
import { Box, Text } from 'grommet';
import { StatusInfo, StatusGood, StatusWarning } from 'grommet-icons';

const InfoBox = ({ status }) => (
  <Box
    gap="small"
    pad="medium"
    round="xsmall"
    align="center"
    direction="row"
    elevation="small"
    background="white"
    animation={{ type: 'fadeIn', duration: 300 }}
  >
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
);

export default InfoBox;
