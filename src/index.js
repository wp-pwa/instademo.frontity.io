import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';
import { Grommet, TextInput, Box, Button, Text, FormField } from 'grommet';
import QRCode from 'qrcode.react';

import store from './store';
import Demo from './components/Demo';
import Icon from './components/Icon';
import InfoBox from './components/InfoBox';
import frontityTheme from './theme';

const App = observer(() => (
  <Grommet theme={frontityTheme}>
    <Box fill justify="center" direction="row" wrap>
      <Box
        gap="large"
        justify="start"
        direction="column"
        width="400px"
        margin="medium"
      >
        <form onSubmit={store.getDemo}>
          <Box
            gap="small"
            pad="medium"
            round="xsmall"
            align="stretch"
            elevation="small"
            background="white"
          >
            <FormField label="WordPress URL" htmlFor="url-input">
              <TextInput
                id="url-input"
                type="url"
                required
                placeholder="https://myblog.com"
                value={store.url}
                onChange={store.onChangeUrl}
                size="small"
              />
            </FormField>
            <FormField label="Email" htmlFor="email-input">
              <TextInput
                id="email-input"
                type="email"
                required
                placeholder="example@myblog.com"
                value={store.email}
                onChange={store.onChangeEmail}
                size="small"
              />
            </FormField>
            <Box direction="row" gap="small">
              <Button
                primary
                color="brand"
                round="xsmall"
                label="live demo"
                disabled={store.busy}
                icon={<Icon />}
                type="submit"
              />
            </Box>
          </Box>
        </form>
        {store.message && <InfoBox status={store.status} />}
        {store.demoUrl && (
          <Box align="center">
            <Box background="white">
              <QRCode value={store.demoUrl} />
            </Box>
          </Box>
        )}
      </Box>
      <Box margin="medium">
        <Demo status={store.status} src={store.demoUrl} />
      </Box>
    </Box>
  </Grommet>
));

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
