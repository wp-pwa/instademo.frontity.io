import { types, flow } from 'mobx-state-tree';
import copy from 'copy-text-to-clipboard';
import api from './api-actions';
import database from './database-actions';

const ssrServer = 'https://ssr.wp-pwa.com';
const staticServer = 'https://static.wp-pwa.com';

export default types
  .model('Store', {
    url: '',
    demoUrl: '',
    name: '',
    categories: types.array(types.frozen()),
    status: types.optional(
      types.enumeration(['idle', 'busy', 'ok', 'error']),
      'idle',
    ),
    message: '',
  })
  .views(self => ({
    get siteId() {
      return `demo-${self.url
        .replace(/^https?:\/\//, '')
        .replace(/\/?$/, '')
        .replace(/[./]/g, '-')}`;
    },
  }))
  .actions(self => ({
    getDemo: flow(function* getDemo(e) {
      e.preventDefault();
      self.reset();
      self.setStatus('busy');

      // Search site in database
      const isCreated = yield self.isDemoCreated();

      if (isCreated) {
        self.setDemoUrl();
        return self.setStatus('ok', 'Demo ready!');
      }

      // Not in database:
      // First, check if the url is a valid WordPress blog
      yield self.checkUrl();
      if (self.status === 'error') return;

      // Then, create the demo
      yield self.createDemo();
      self.setDemoUrl();
    }),
    setStatus: (status, message = '') => {
      self.status = status;
      self.message = message;
    },
    setDemoUrl() {
      self.demoUrl = `${ssrServer}/?siteId=${
        self.siteId
      }&static=${staticServer}`;
    },
    reset: () => {
      self.demoUrl = '';
      self.name = '';
      self.categories = [];
      self.setStatus('idle', '');
    },
    onChangeUrl: event => (self.url = event.target.value),
    copyDemoUrl: () => {
      copy(self.demoUrl);
      self.message = 'Link copied!';
    },
    showFallback: () => {
      self.url = 'https://blog.frontity.com';
      self.setDemoUrl();
      self.setStatus('ok', 'See other example');
    },
  }))
  .actions(api)
  .actions(database)
  .create({});
