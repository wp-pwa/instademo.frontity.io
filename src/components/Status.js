import React from 'react';
import { Box, Text } from 'grommet';
import { StatusGoodSmall as Icon } from 'grommet-icons';

const Status = ({ name, status }) => {
  let color;
  if (status === 'ok') {
    color = 'status-ok';
  } else if (status === 'error') {
    color = 'status-error';
  } else {
    color = 'status-unknown';
  }

  return (
    <Box direction="row" gap="small" align="center">
      <Box>
        <Icon size="20px" color={color} />
      </Box>
      <Text weight={600} size="small" color={color}>
        {name}
      </Text>
    </Box>
  );
};

export default Status;
