jest.mock('graphql-request', () => ({
  GraphQLClient: jest.fn(),
}));
import { sourceNodes } from '../src/gatsby-node';
import { GraphQLClient } from 'graphql-request';

const getGatsbyApi = createNode => ({
  boundActionCreators: {
    createNode: createNode,
  },
});

const getPluginOptions = (options = {}) => ({
  headers: {
    Authorization: 'Bearer 1234fake',
  },
  queries: [],
  ...options,
});

const getMockedGraphqlClient = (request = jest.fn()) => {
  return GraphQLClient.mockImplementation(() => {
    return {
      request: request,
    };
  });
};

test('it does not call createNode with empty queries', async () => {
  const createNode = jest.fn();
  try {
    await sourceNodes(getGatsbyApi(createNode), getPluginOptions());
  } catch (e) {
    // do not care
  } finally {
    expect(createNode).not.toHaveBeenCalled();
  }
});

test('it calls createNode with object', async () => {
  const createNode = jest.fn();
  const request = jest.fn();
  getMockedGraphqlClient(request);
  const mockQueryResult = {
    viewer: {
      login: 'dschau',
      name: 'dustin',
    },
  };
  request.mockReturnValueOnce(mockQueryResult);
  await sourceNodes(
    getGatsbyApi(createNode),
    getPluginOptions({
      queries: [`{}`],
    })
  );

  expect(createNode).toHaveBeenCalledTimes(1);
  expect(createNode).toHaveBeenCalledWith(
    expect.objectContaining({
      ...mockQueryResult.viewer,
      internal: expect.objectContaining({
        type: 'GithubViewer',
      }),
    })
  );
});

test('it calls createNode with all edges when edges', async () => {
  const createNode = jest.fn();
  const request = jest.fn();
  getMockedGraphqlClient(request);
  const mockQueryResult = {
    repository: {
      issues: {
        edges: [
          {
            node: {
              id: 1,
            },
          },
          {
            node: {
              id: 2,
            },
          },
        ],
      },
    },
  };

  request.mockReturnValueOnce(mockQueryResult);
  await sourceNodes(
    getGatsbyApi(createNode),
    getPluginOptions({
      queries: [`{}`],
    })
  );

  expect(createNode).toHaveBeenCalledTimes(
    mockQueryResult.repository.issues.edges.length
  );
  expect(createNode).toHaveBeenCalledWith(
    expect.objectContaining({
      id: expect.any(Number),
      internal: expect.objectContaining({
        type: 'GithubIssues',
      }),
    })
  );
});
