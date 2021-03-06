import { flow } from 'mobx-state-tree';
import request from 'superagent';
import { decode } from 'he';

const proxy = 'https://cdn.frontity.cloud/';

export default self => ({
  isUrlAccessible: flow(function* isUrlAccessible() {
    try {
      yield request(`${proxy}${self.url}`).accept('text/html');
    } catch (error) {
      return errorInfo('Error accessing URL', error);
    }
  }),
  isWordPress: flow(function* isWordPress() {
    try {
      const wp = yield apiGet(self.url, '/');
      if (!wp) return 'Empty response from "?rest_route=/"';
      self.name = decode(wp.name);
    } catch (error) {
      return errorInfo('Error accessing "?rest_route=/"', error);
    }
  }),
  hasPosts: flow(function* hasPosts() {
    try {
      const posts = yield apiGet(self.url, '/wp/v2/posts');
      if (!(posts && posts.length)) return 'No posts';
    } catch (error) {
      return errorInfo('Error getting posts', error);
    }
  }),
  hasCategories: flow(function* hasCategories() {
    try {
      const categories = yield apiGet(
        self.url,
        '/wp/v2/categories',
        'per_page=20',
      );
      if (!(categories && categories.length)) return 'No categories';
      // Get the five categories with more posts
      self.categories = categories
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    } catch (error) {
      return errorInfo('Error getting categories', error);
    }
  }),
  runTasks: flow(function* runTasks() {
    try {
      for (let name of self.taskList) {
        yield self.runTask(name);
      }
    } catch (error) {
      console.warn(error);
    }

    if (self.error) return;
  }),
  runTask: flow(function* runTask(name, task) {
    self.setStatus(name, 'busy');
    const error = yield self[name]();
    if (error) {
      self.setStatus(name, 'error', error);
      throw new Error(self.error);
    }
    self.setStatus(name, 'ok');
  }),
});

const apiGet = async (wpUrl, endpoint, query) => {
  const restRoute = `${endpoint}${query ? `&${query}` : ''}`;
  const { body } = await request
    .get(`${proxy}${wpUrl}/?rest_route=${restRoute}`)
    .accept('application/json');
  return body;
};

const errorInfo = (message, error) => {
  let info = '';
  if (error.parse) info = 'invalid response type';
  else if (error.timeout) info = 'timeout';
  else if (error.crossDomain) info = 'cross domain';
  else if (error.unauthorized) info = 'unauthorized';
  else if (error.notAcceptable) info = 'not acceptable';
  else if (error.notFound) info = 'not found';
  else if (error.forbidden) info = 'forbidden';
  return info ? `${message}: ${info}` : message;
};
