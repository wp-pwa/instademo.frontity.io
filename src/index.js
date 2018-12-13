import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';
// import { Link } from 'grommet-icons';
import { base as theme } from 'grommet/themes';
import {
  Grommet,
  TextInput,
  Box,
  Button,
  Text,
  FormField,
  ThemeContext,
} from 'grommet';

import store from './store';
import Demo from './components/Demo';
import Icon from './components/Icon';
import frontityTheme from './theme';

const App = observer(() => (
  <Grommet theme={theme}>
    <ThemeContext.Extend value={frontityTheme}>
      <Box fill gap="large" justify="center" direction="row">
        <Box gap="large" justify="start" direction="column" width="400px">
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
          <Box
            gap="small"
            pad="medium"
            round="xsmall"
            align="stretch"
            elevation="small"
            background="white"
          >
            <Text>{store.message}</Text>
          </Box>
        </Box>
        <Demo status={store.status} src={store.demoUrl} />
      </Box>
    </ThemeContext.Extend>
  </Grommet>
));

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
