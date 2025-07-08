import { tl } from '@mtcute/tl';

const RETRY_ERRORS = [
  'MSG_WAIT_FAILED',
  'MSG_ID_INVALID'
];

export async function retryOnRpcError<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (tl.RpcError.is(error) && RETRY_ERRORS.includes(error.text) && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}