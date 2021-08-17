import { GraphQLClient } from 'graphql-request';
import crypto from 'crypto';
import { startCase, toLower } from 'lodash';

import { schema } from './plugin-options';

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`);

const getRootEl = obj => Object.keys(obj).shift();

const findEdge = obj => {
  let clone = Object.assign({}, obj);
  while (Object.keys(clone).length > 0) {
    const rootEl = getRootEl(clone);
    if (clone[rootEl] && Array.isArray(clone[rootEl].edges)) {
      return clone;
    }
    clone = clone[rootEl];

    if (typeof clone !== 'object') {
      break;
    }
  }

  return obj;
};

const upper = str => startCase(toLower(str));

export async function sourceNodes({ actions }, pluginOptions) {
  const { createNode } = actions;

  const { headers, queries, url: apiUrl } = await schema.validate(
    pluginOptions
  );

  const client = new GraphQLClient(apiUrl, {
    headers,
  });

  await Promise.all(
    queries.map(query => client.request(...[].concat(query)))
  ).then(results => {
    results.forEach((content, index) => {
      const edge = findEdge(content);
      const rootName = getRootEl(edge);
      const rootElement = edge[rootName];

      const { edges, ...rest } = rootElement;

      if (rootElement && Array.isArray(rootElement.edges)) {
        rootElement.edges.forEach((childNode, edgeIndex) => {
          const node = childNode.node || childNode;
          createNode({
            ...rest,
            ...node,
            id: node.id || `__github__${rootName}__${edgeIndex}__`,
            children: [],
            parent: '__SOURCE__',
            internal: {
              type: `Github${upper(rootName)}`,
              contentDigest: createContentDigest(node),
              content: JSON.stringify(node),
            },
          });
        });
      } else {
        createNode({
          ...rootElement,
          id: rootElement.id || `__github__${rootName}__${index}`,
          children: [],
          parent: '__SOURCE__',
          internal: {
            type: `Github${upper(rootName)}`,
            contentDigest: createContentDigest(rootElement),
            content: JSON.stringify(rootElement),
          },
        });
      }
    });
  });

  return;
}
