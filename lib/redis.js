import { Redis } from '@upstash/redis';

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis = null;

if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn('Upstash Redis credentials are not set. Redis caching will be skipped.');
}

export default redis;
