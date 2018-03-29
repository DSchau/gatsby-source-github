# gatsby-source-github

Source plugin for pulling in Github data (using it's [GraphQL API][github-api]) at buildtime for static generation and further GraphQL querying with Gatsby

## Install

```bash
npm install gatsby-source-github
```

## How to use

In your `gatsby-config.js`:

```javascript
plugins: [
  {
    resolve: 'gatsby-source-github',
    options: {
      headers: {
        Authorization: `Bearer YOUR_GITHUB_PERSONAL_ACCESS_TOKEN`, // https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/
      },
      queries: [
        `{
          repository(owner: "nebraskajs", name: "speaker-signup") {
            issues(last: 20, states: OPEN) {
              edges {
                node {
                  id
                  author {
                    avatarUrl
                    login
                    url
                  }
                  bodyHTML
                  title
                  url
                }
              }
            }
          }
        }`,
      ],
    },
  },
];
```

`queries` is an array of GraphQL queries. The algorithm to generate Gatsby GraphQL nodes is described [below](#the-algorithm)

### The algorithm

The algorithm is quite simple. It'll descend through the tree/returned structure, and if it finds an `edges` parameter will use the parent of that as the node name. For instance, in the above example, `githubIssue` will be the node name, and `allGithubIssues` will be the way to query against all nodes. All fields in the node that are queried against in the Github GraphQL query are available to be queried with Gatsby. For example, in the above example, `id`, `author` (and subfields), `bodyHTML`, etc. are available to be queried against.

[github-api]: https://developer.github.com/v4/
