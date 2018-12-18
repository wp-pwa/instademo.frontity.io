import { flow } from 'mobx-state-tree';
import request from 'superagent';
import { decode } from 'he';

import { isWordPress, hasPosts, hasCategories } from './statuses';

const proxy = 'https://cdn.frontity.cloud';

export default self => ({
  checkUrl: flow(function* checkAPI() {
    // Get WP data
    self.setStatus(isWordPress, 'busy');
    const wp = yield self.get('/');
    if (!wp) {
      self.setStatus(isWordPress, 'error');
      return;
    }
    self.setStatus(isWordPress, 'ok');

    // Get name
    self.name = decode(wp.name);

    // Get posts
    self.setStatus(hasPosts, 'busy');
    const posts = yield self.get('/wp/v2/posts');
    if (!(posts && posts.length)) {
      self.setStatus(hasPosts, 'error');
      return;
    }
    self.setStatus(hasPosts, 'ok');

    // Get categories
    self.setStatus(hasCategories, 'busy');
    const categories = yield self.get('/wp/v2/categories', 'per_page=20');
    if (!(categories && categories.length)) {
      self.setStatus(hasCategories, 'error');
      return;
    }
    self.setStatus(hasCategories, 'ok');

    // Get the five categories with more posts
    self.categories = categories.sort((a, b) => b.count - a.count).slice(0, 5);
  }),
  get: flow(function* get(route, query) {
    try {
      const { status, body } = yield request
        .get(`${proxy}/${self.url}/?rest_route=${route}&${query}`)
        .timeout({ response: 15000 });
      return status === 200 ? body : null;
    } catch (error) {
      // Hide errors
    }
  }),
});
