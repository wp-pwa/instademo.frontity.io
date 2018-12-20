import { flow } from 'mobx-state-tree';
import request from 'superagent';
import { decode } from 'he';

const proxy = 'https://cdn.frontity.cloud/';

export default [
  {
    name: 'isUrlAccessible',
    func: flow(function* isUrlAccessible(self) {
      try {
        yield request(`${proxy}${self.url}`)
          .accept('text/html')
          .timeout({ response: 10000 });
      } catch (error) {
        return errorInfo('Error accessing URL', error);
      }
    }),
  },
  {
    name: 'isWordPress',
    func: flow(function* isWordPress(self) {
      try {
        const wp = yield apiGet(self.url, '/');
        if (!wp) return 'Empty response from "?rest_route=/"';
        self.name = decode(wp.name);
      } catch (error) {
        return errorInfo('Error accessing "?rest_route=/"', error);
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
        return errorInfo('Error getting posts', error);
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
        return errorInfo('Error getting categories', error);
      }
    }),
  },
];

const apiGet = async (wpUrl, endpoint, query) => {
  const restRoute = `${endpoint}${query ? `&${query}` : ''}`;
  const { body } = await request
    .get(`${proxy}${wpUrl}/?rest_route=${restRoute}`)
    .accept('application/json')
    .timeout({ response: 10000 });
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
