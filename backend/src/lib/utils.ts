import type { Option } from '@polkadot/types-codec';
import type { H256 } from '@polkadot/types/interfaces/runtime';

export const shortHash = (hash: string): string =>
  `${hash.substring(0, 6)}…${hash.substring(hash.length - 4, hash.length)}`;

export const wait = async (ms: number): Promise<number> =>
  new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });

// from https://stackoverflow.com/questions/19269545/how-to-get-a-number-of-random-elements-from-an-array
export const getRandom = (arr: any[], n: number): any[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

// Return array chunks of n size
export const chunker = (a: any[], n: number): any[] =>
  Array.from({ length: Math.ceil(a.length / n) }, (_, i) =>
    a.slice(i * n, i * n + n),
  );

// Return a reverse ordered array filled from range
export const reverseRange = (
  start: number,
  stop: number,
  step: number,
): number[] =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => stop - i * step);

// Return filled array from range
export const range = (start: number, stop: number, step: number): number[] =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

//
// xx.network related utils
//
export const toByteArray = (nodeId: H256) => Buffer.concat([nodeId.toU8a(true), new Uint8Array([2])]);

export const toBase64 = (cmixId: Buffer) => cmixId.toString('base64');

export const transformCmixAddress = (nodeId?: Option<H256>): string | undefined => (nodeId?.isSome && Number(nodeId) !== 0) ? toBase64(toByteArray(nodeId.unwrap())) : '';
