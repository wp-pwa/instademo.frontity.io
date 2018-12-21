import { types, flow } from 'mobx-state-tree';
import request from 'superagent';

import databaseActions from './database-actions';
import taskActions from './tasks';

const ssrServer = 'https://ssr.wp-pwa.com';
const staticServer = 'https://static.wp-pwa.com';

const taskList = [
  'isUrlAccessible',
  'isWordPress',
  'hasPosts',
  'hasCategories',
  'createDemo',
];

export default types
  .model('Store', {
    url: '',
    email: '',
    demoUrl: '',
    name: '',
    categories: types.array(types.frozen()),
    taskList: types.optional(types.array(types.string), taskList),
    statusList: types.map(types.enumeration(['idle', 'busy', 'ok', 'error'])),
    error: '',
  })
  .views(self => ({
    get siteId() {
      if (self.url === 'https://blog.frontity.com') return 'PHAzpvws5pvZw7XuW';
      return `demo-${self.url
        .replace(/^https?:\/\//, '')
        .replace(/\/?$/, '')
        .replace(/[./]/g, '-')}`;
    },
    get status() {
      const statusArray = Array.from(self.statusList.values());

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
        self.setAllStatus('ok');
      } else {
        yield self.runTasks();
        if (self.status !== 'error') {
          self.setDemoUrl();
        }
      }

      // Log useful info
      console.log({
        status: self.status,
        statusList: [...self.statusList.entries()],
        error: self.error,
      });

      // Send data to integromat
      const result = {
        source: 'demo',
        wpUrl: self.url,
        email: self.email,
        status: self.status,
        error: self.error,
      };
      yield request
        .post('https://hook.integromat.com/9jvf2oiladaib7wbb9k75odshqw6bork')
        .query(result);
    }),
    setStatus: (name, status, error) => {
      self.statusList.set(name, status);
      if (error) self.error = error;
    },
    setAllStatus: status => {
      self.statusList.forEach((_, key, map) => map.set(key, status));
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

      self.statusList.clear();
      taskList.forEach(name => self.statusList.set(name, 'idle'));
    },
    onChangeUrl: event => (self.url = event.target.value),
    onChangeEmail: event => (self.email = event.target.value),
    onIframeLoad: () => {
      // self.statusList.set(name, status);
    },
    onIframeError: () => {
      // self.statusList.set(name, status);
    },
    showFallback: () => {
      self.url = 'https://blog.frontity.com';
      self.getDemo();
    },
  }))
  .actions(taskActions)
  .actions(databaseActions)
  .create({});
