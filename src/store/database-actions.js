import { flow } from 'mobx-state-tree';
import { decode } from 'he';
import client from '../graphql/client';

export default self => ({
  isDemoCreated: flow(function* getDemo() {
    // Search site in database
    const { allSites } = yield client.query(`{
        allSites(filter: {
          siteId: "${self.siteId}"
        }) {
          id
        }
      }`);

    return !!allSites.length;
  }),
  createDemo: flow(function* createDemo() {
    self.setStatus('busy', 'Generating demo...');
    // Set theme settings
    const themeSettings = {
      packageName: 'saturn-theme',
      data: {
        menu: [
          {
            tag: 0,
            page: 0,
            category: 0,
            label: 'HOME',
            type: 'latest',
          },
        ].concat(
          self.categories.map(({ name, id }) => ({
            url: self.url,
            tag: 0,
            page: 0,
            label: decode(name),
            category: id,
            type: 'category',
          })),
        ),
        title: self.name || 'DEMO',
        mainColor: '#ffffff',
        lang: 'en',
      },
    };

    // Set connection settings
    const connectionSettings = {
      packageName: 'wp-org-connection',
      data: {
        cdn: {
          media: `https://cdn.frontity.media/${self.url}`,
          api: `https://cdn.frontity.cloud/https://services.frontity.cloud/add-media-ids/${
            self.url
          }`,
        },
      },
    };

    yield client.mutate(`{
      createDemo(
        siteId: "${self.siteId}"
        url: "${self.url}"
        settings: [
          "${JSON.stringify(themeSettings).replace(/"/g, '\\"')}",
          "${JSON.stringify(connectionSettings).replace(/"/g, '\\"')}"
        ]
      )
      {
        siteId
      }
    }`);

    self.setStatus('ok', 'Demo generated!');
  }),
});
