import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';
import { Link } from 'grommet-icons';
import { grommet } from 'grommet/themes';
import { Grommet, Heading, TextInput, Box, Button, Text } from 'grommet';

import store from './store';
import Demo from './components/Demo';
import Status from './components/Status';

const App = observer(() => (
  <Grommet theme={grommet}>
    <Box gap="large" align="center">
      <Heading>Demo Generator</Heading>
      <form onSubmit={store.getDemo}>
        <Box gap="medium" align="start">
          <Text>{store.message || 'Write the url below.'}</Text>
          <TextInput
            label="website url"
            name="url"
            type="url"
            placeholder="https://myblog.com"
            value={store.url}
            onClick={store.reset}
            onChange={store.onChangeUrl}
            size="small"
          />
          <Box direction="row" gap="small">
            <Button
              label="get demo"
              disabled={store.busy}
              icon={<Status status={store.status} />}
              type="submit"
            />
            <Button
              label="get link"
              onClick={store.copyDemoUrl}
              disabled={store.status !== 'ok'}
              icon={<Link size="medium" color="brand" />}
            />
          </Box>
          <Demo status={store.status} src={store.demoUrl} />
        </Box>
      </form>
    </Box>
  </Grommet>
));

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
