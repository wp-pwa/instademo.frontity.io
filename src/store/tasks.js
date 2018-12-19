import { flow } from 'mobx-state-tree';
import request from 'superagent';
import { decode } from 'he';

const proxy = 'https://cdn.frontity.cloud';

export default [
  {
    name: 'isUrlAccessible',
    func: flow(function* isUrlAccessible(self) {
      try {
        yield request(`${proxy}/${self.url}`).accept('text/html');
      } catch (error) {
        return 'URL is inaccessible';
      }
    }),
  },
  {
    name: 'isWordPress',
    func: flow(function* isWordPress(self) {
      try {
        const wp = yield apiGet(self.url, '/');
        self.name = decode(wp.name);
      } catch (error) {
        console.log({ ...error });
        return 'Error accessing API';
      }
    }),
  },
  // Get posts
  {
    name: 'hasPosts',
    func: flow(function* hasPosts(self) {
      try {
        const posts = yield apiGet(self.url, '/wp/v2/posts');
        if (!(posts && posts.length)) return 'No posts';
      } catch (error) {
        const info = getErrorInfo(error);
        return `Error getting posts${info && `: ${info}`}`;
      }
    }),
  },
  // Get categories
  {
    name: 'hasCategories',
    func: flow(function* hasCategories(self) {
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
        const info = getErrorInfo(error);
        return `Error getting categories${info && `: ${info}`}`;
      }
    }),
  },
];

const apiGet = async (wpUrl, endpoint, query) => {
  const restRoute = `${endpoint}${query ? `&${query}` : ''}`;
  const { body } = await request
    .get(`${proxy}/${wpUrl}/?rest_route=${restRoute}`)
    .accept('application/json')
    .timeout({ response: 15000 });
  return body;
};

const getErrorInfo = error => {
  if (error.parse) return 'invalid response type';
  if (error.timeout) return 'timeout';
};
