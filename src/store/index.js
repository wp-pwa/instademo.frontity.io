import { types, flow } from 'mobx-state-tree';
import { when } from 'mobx';

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
        self.taskList.forEach(name => self.setStatus(name, 'ok'));
        // console.log([...self.statusList.entries()], self.demoUrl);
      } else {
        // Fix URLs without protocol
        if (!/^(?:https?:\/\/)/.test(self.url)) {
          self.url = `http://${self.url}`;
        }
        yield self.runTasks();
      }

      if (self.status !== 'error') {
        self.setDemoUrl();

        // Wait for iframe load or error
        self.setStatus('hasIframeLoaded', 'busy');
        const countdown = setTimeout(
          () => self.iframeOnError(),
          60000, // error after 60 seconds
        );

        yield when(() =>
          ['ok', 'error'].includes(self.statusList.get('hasIframeLoaded')),
        );
        clearTimeout(countdown);
      }

      // Log useful info
      // console.log({
        status: self.status,
        statusList: [...self.statusList.entries()],
        error: self.error,
      });

      const result = {
        url: self.url,
        demoUrl: self.demoUrl,
        email: self.email,
        status: self.status,
        error: self.error,
      };

      // Send data to GTM
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'instademoResultEvent',
        instademoResultEvent: result,
      });
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
      taskList.forEach(name => self.setStatus(name, 'idle'));
      self.setStatus('hasIframeLoaded', 'idle');
    },
    onChangeUrl: event => (self.url = event.target.value),
    onChangeEmail: event => (self.email = event.target.value),
    iframeOnLoad: () => {
      if (self.statusList.get('hasIframeLoaded') === 'busy') {
        self.setStatus('hasIframeLoaded', 'ok');
      }
    },
    iframeOnError: () => {
      self.setStatus('hasIframeLoaded', 'error', 'Iframe timeout');
    },
    showFallback: () => {
      self.url = 'https://blog.frontity.com';
      self.getDemo();
    },
    afterCreate: () => {
      self.reset();
    },
  }))
  .actions(taskActions)
  .actions(databaseActions)
  .create({});
