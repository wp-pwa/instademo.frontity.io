import React from 'react';
import ReactDOM from 'react-dom';
import { Grommet, Box } from 'grommet';
import { Form, InfoBox, Demo } from './components';
import frontityTheme from './theme';

const App = () => (
  <Grommet theme={frontityTheme}>
    <Box fill justify="center" direction="row" wrap>
      <Box
        gap="large"
        justify="start"
        direction="column"
        width="450px"
        margin="medium"
      >
        <Form />
        <InfoBox />
      </Box>
      <Box margin="medium">
        <Demo />
      </Box>
    </Box>
  </Grommet>
);

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
