export default ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'strapiDB'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi_arc'),
      user: env('DATABASE_USERNAME', 'gscarv13'),
      password: env('DATABASE_PASSWORD', 'gscarv13'),
      ssl: env.bool('DATABASE_SSL', false),
    },
  },
});
