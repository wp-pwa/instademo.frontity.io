import React from 'react';
import { Box, Text, Paragraph, Anchor } from 'grommet';
// import { StatusInfo, StatusGood, StatusWarning } from 'grommet-icons';
import QRCode from 'qrcode.react';
import styled from 'styled-components';

import Status from './Status';
import inject from './inject';

const InfoBox = ({ status, statusWP, statusPosts, statusDemo, demoUrl }) =>
  status !== 'idle' && (
    <Box
      gap="large"
      pad="40px"
      round="xsmall"
      elevation="small"
      background="white"
      animation={{ type: 'fadeIn', duration: 300 }}
    >
      {status !== 'error' ? (
        <Box align="start" gap="small">
          <Status
            name="Connecting with your WordPress site"
            status={statusWP}
          />
          <Status name="Collecting latest posts" status={statusPosts} />
          <Status name="Generating your live demo" status={statusDemo} />
        </Box>
      ) : (
        <Status name="Oops! Something went wrong" status="error" />
      )}
      {status !== 'error' ? (
        <Opacity value={status === 'ok' ? 1 : 0.2}>
          <Box align="center" gap="medium">
            <Box width="128px" height="128px">
              <QRCode value={demoUrl || 'DEMO'} />
            </Box>
            <Text as="label" textAlign="center">
              Scan QR code to view this demo on your mobile phone and discover
              more features
            </Text>
          </Box>
        </Opacity>
      ) : (
        <Box gap="medium">
          <Paragraph size="small" margin={{ vertical: '0' }}>
            We haven't been able to generate your demo, we will get back to you
            by <strong>email</strong> shortly
          </Paragraph>
          <Paragraph size="small" margin={{ vertical: '0' }}>
            Make sure your WordPress is a <strong>blog</strong> or{' '}
            <strong>news</strong> site. We only support sites using posts/pages.
          </Paragraph>
          <Paragraph size="small" margin={{ vertical: '0' }}>
            In the meantime, you can visit{' '}
            <Anchor href="https://blog.frontity.com">
              https://blog.frontity.com
            </Anchor>{' '}
            from a mobile phone to see our PWA theme in action.
          </Paragraph>
        </Box>
      )}
    </Box>
  );

export default inject(
  ({ store }) => ({
    status: store.status,
    statusWP: store.statuses.get('isWordPress'),
    statusPosts: store.statuses.get('hasPosts'),
    statusDemo: store.status,
    demoUrl: store.demoUrl,
  }),
  InfoBox,
);

const Opacity = styled.div`
  opacity: ${({ value = 1 }) => value};
`;
