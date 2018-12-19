import { types, flow } from 'mobx-state-tree';
import request from 'superagent';

import api from './api-actions';
import database from './database-actions';
import tasks from './tasks';

const ssrServer = 'https://ssr.wp-pwa.com';
const staticServer = 'https://static.wp-pwa.com';

export default types
  .model('Store', {
    url: '',
    email: '',
    demoUrl: '',
    name: '',
    categories: types.array(types.frozen()),
    statuses: types.map(types.enumeration(['idle', 'busy', 'ok', 'error'])),
    error: '',
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
        self.statuses.forEach((_, key, map) => map.set(key, 'ok'));
      } else {
        // First, check if the url is a valid WordPress blog
        yield self.runTasks();
        if (self.status !== 'error') {
          // Then, create the demo
          yield self.createDemo();
          self.setDemoUrl();
        }
      }

      const result = {
        source: 'demo',
        wpUrl: self.url,
        email: self.email,
        status: self.status,
        error: self.error,
      };

      console.log(result);

      // Send data to integromat
      yield request
        .post('https://hook.integromat.com/9jvf2oiladaib7wbb9k75odshqw6bork')
        .query(result);
    }),
    setStatus: (name, status, error) => {
      self.statuses.set(name, status);
      if (error) self.error = error;
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
      self.error = '';

      self.statuses.clear();
      tasks.forEach(({ name }) => self.statuses.set(name, 'idle'));
    },
    onChangeUrl: event => (self.url = event.target.value),
    onChangeEmail: event => (self.email = event.target.value),
    showFallback: () => {
      self.url = 'https://blog.frontity.com';
      self.getDemo();
    },
  }))
  .actions(api)
  .actions(database)
  .create({});
