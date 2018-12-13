import React from 'react';
import { StatusGoodSmall as Icon } from 'grommet-icons';

const Status = ({ status }) => {
  let color;
  if (status === 'busy') {
    color = 'status-warning';
  } else if (status === 'ok') {
    color = 'status-ok';
  } else if (status === 'error') {
    color = 'status-error';
  } else {
    color = 'brand';
  }

  return <Icon size="medium" color={color} />;
};

export default Status;
