import { flow } from 'mobx-state-tree';
import request from 'superagent';
import { decode } from 'he';

const proxy = 'https://cdn.frontity.cloud';

export default self => ({
  checkUrl: flow(function* checkAPI() {
    // Get WP data
    self.setStatus('busy', 'Getting WP data...');
    const wp = yield self.get('/');
    if (!wp) {
      return self.setStatus('error', 'Not a WordPress site with public API.');
    }

    // Get name
    self.name = decode(wp.name);

    // Get posts
    self.setStatus('busy', 'Checking posts...');
    const posts = yield self.get('/wp/v2/posts');
    if (!(posts && posts.length)) {
      return self.setStatus('error', 'WordPress without posts.');
    }

    // Get categories
    self.setStatus('busy', 'Checking categories...');
    const categories = yield self.get('/wp/v2/categories', 'per_page=20');
    if (!(categories && categories.length)) {
      return self.setStatus('error', 'No category with posts.');
    }

    console.log(categories);

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
