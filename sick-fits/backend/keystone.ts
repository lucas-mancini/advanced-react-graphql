import { createAuth } from '@keystone-next/auth';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { withItemData, statelessSessions } from '@keystone-next/keystone/session';

import 'dotenv/config';

import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { User } from './schemas/User';
import { insertSeedData  } from './seed-data';

const databaseURL = process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // how long should they stay signed in
  secret: process.env.COOKIE_SECRET,
}

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: add in initial roles here
  }
});

export default withAuth(config({
  server: {
    cors: {
      origin: [process.env.FRONTEND_URL],
      credentials: true,
    }
  },
  db: {
    adapter: 'mongoose',
    url: databaseURL,
    onConnect: async (keystone) => {
      if (process.argv.includes('--seed-data')) {
        await insertSeedData(keystone);
      }
    }
  },
  lists: createSchema({
    User,
    Product,
    ProductImage,
  }),
  ui: {
    // TODO: Show the UI only for people who pass this test
    isAccessAllowed: ({ session }) => {
      return Boolean(session?.data);
    },
  },
  session: withItemData(statelessSessions(sessionConfig), {
    // GraphQL Query
    User: 'id',
  }),
}));
