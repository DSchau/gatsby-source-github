import yup from 'yup';

export const schema = yup.object().shape({
  headers: yup.object().shape({
    Authorization: yup
      .string()
      .matches(/^Bearer\s.*/, {
        message:
          'headers.Authorization must include Bearer token, e.g. `Bearer YOUR_TOKEN_HERE`',
      })
      .required(),
  }),
  queries: yup
    .array()
    .min(1)
    .required(),
  url: yup.string().default(`https://api.github.com/graphql`),
});
