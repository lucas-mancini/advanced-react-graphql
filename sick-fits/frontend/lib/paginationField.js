/* eslint-disable no-plusplus */
import { PAGINATION_QUERY } from '../components/Pagination';

export default function PaginationField() {
  return {
    keyArgs: false,

    read(existing = [], { args, cache }) {
      // Apollo asks the read() function for the products.
      // If it returns false, a network request will occur.

      const { skip, first } = args;
      const data = cache.readQuery({ query: PAGINATION_QUERY });
      const count = data?._allProductsMeta?.count;
      const page = skip / first + 1;
      const pages = Math.ceil(count / first);

      const items = existing.slice(skip, skip + first).filter((x) => x);

      if (items.length && items.length !== first && page === pages) {
        return items;
      } 
      if (items.length !== first) {
        return false;
      }

      if (items.length) {
        console.log(`There are ${items.length} in the cache.`);
      }

      return items;
    },

    merge(existing, incoming, { args }) {
      // This runs when the Apollo client comes back from the network with the products.
      console.log(`Merging items from the network ${incoming.length}`);
      const { skip } = args;
      const merged = existing ? existing.slice(0) : [];

      for (let i = skip; i < skip + incoming.length; i++) {
        merged[i] = incoming[i - skip];
      }

      return merged;
    },
  };
}
