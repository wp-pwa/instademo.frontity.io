import { types, flow } from 'mobx-state-tree';
import api from './api-actions';
import database from './database-actions';

import { isWordPress, hasPosts, hasCategories, gettingDemo } from './statuses';

const ssrServer = 'https://ssr.wp-pwa.com';
const staticServer = 'https://static.wp-pwa.com';

export default types
  .model('Store', {
    url: '',
    demoUrl: '',
    name: '',
    categories: types.array(types.frozen()),
    statuses: types.map(types.enumeration(['idle', 'busy', 'ok', 'error'])),
  })
  .views(self => ({
    get siteId() {
      return `demo-${self.url
        .replace(/^https?:\/\//, '')
        .replace(/\/?$/, '')
        .replace(/[./]/g, '-')}`;
    },
    get status() {
      const statusArray = Array.from(self.statuses.values());

      if (!statusArray.length) return 'idle';

      if (statusArray.some(status => status === 'error')) {
        return 'error';
      } else if (statusArray.every(status => status === 'ok')) {
        return 'ok';
      } else if (statusArray.every(status => status === 'idle')) {
        return 'idle';
      }
      return 'busy';
    },
  }))
  .actions(self => ({
    getDemo: flow(function* getDemo(e) {
      if (e) e.preventDefault();
      self.reset();

      // Search site in database
      const isCreated = yield self.isDemoCreated();

      if (isCreated) {
        self.setDemoUrl();
        self.setStatus(isWordPress, 'ok');
        self.setStatus(hasPosts, 'ok');
        self.setStatus(hasCategories, 'ok');
        self.setStatus(gettingDemo, 'ok');
        return;
      }

      // First, check if the url is a valid WordPress blog
      yield self.checkUrl();
      if (self.status === 'error') return;

      // Then, create the demo
      yield self.createDemo();
      self.setDemoUrl();
    }),
    setStatus: (name, status) => {
      self.statuses.set(name, status);
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
      self.setStatus(isWordPress, 'idle');
      self.setStatus(hasPosts, 'idle');
      self.setStatus(hasCategories, 'idle');
      self.setStatus(gettingDemo, 'idle');
    },
    onChangeUrl: event => (self.url = event.target.value),
    showFallback: () => {
      self.url = 'https://blog.frontity.com';
      self.getDemo();
    },
  }))
  .actions(api)
  .actions(database)
  .create({});
