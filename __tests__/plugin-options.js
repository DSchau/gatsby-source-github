import { schema } from '../src/plugin-options';

describe('error handling', () => {
  [
    [
      'missing authorization',
      { headers: {}, queries: [``] },
      'headers.Authorization is a required',
    ],
    [
      'invalid authorization',
      { headers: { Authorization: '1234' }, queries: [``] },
      'headers.Authorization must include Bearer token',
    ],
    [
      'empty queries',
      { headers: { Authorization: 'Bearer 1234' }, queries: [] },
      'queries field must have at least 1 items',
    ],
  ].forEach(([name, options, message]) => {
    test(name, async () => {
      try {
        await schema.validate(options);
      } catch (e) {
        expect(e.message).toMatch(message);
      }
    });
  });
});
