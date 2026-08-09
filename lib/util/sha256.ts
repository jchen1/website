// Synchronous SHA-256, adapted from the public-domain implementation by
// Geraint Luff (github.com/geraintluff/sha256). Input strings are UTF-8
// encoded before hashing, matching crypto-js and Web Crypto behavior.

// Initial hash values: first 32 bits of the fractional parts of the square
// roots of the first 8 primes (the first 64 are computed; extras feed `k`).
const h: number[] = [];
// Round constants: first 32 bits of the fractional parts of the cube roots
// of the first 64 primes.
const k: number[] = [];

{
  const maxWord = 2 ** 32;
  const isComposite: Record<number, boolean> = {};
  let primeCounter = 0;
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      h[primeCounter] = (candidate ** 0.5 * maxWord) | 0;
      k[primeCounter++] = (candidate ** (1 / 3) * maxWord) | 0;
    }
  }
}

function rightRotate(value: number, amount: number) {
  return (value >>> amount) | (value << (32 - amount));
}

export default function sha256(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let ascii = "";
  for (let i = 0; i < bytes.length; i++) {
    ascii += String.fromCharCode(bytes[i]);
  }

  const maxWord = 2 ** 32;
  let result = "";

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = h.slice(0, 8);

  ascii += "\x80"; // Append '1' bit (plus zero padding)
  while (ascii.length % 64 !== 56) ascii += "\x00"; // More zero padding
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] = words[i >> 2] | 0 | (j << (((3 - i) % 4) * 8));
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  // process each chunk
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16)); // The message is expanded into 64 words as part of the iteration
    const oldHash = hash;
    // This is now the "working hash", often labelled as variables a...g
    // (we have to truncate as well, otherwise extra entries at the end accumulate)
    hash = hash.slice(0, 8);

    for (let i = 0; i < 64; i++) {
      // Expand the message into 64 words
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      // Iterate
      const a = hash[0];
      const e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
        ((e & hash[5]) ^ (~e & hash[6])) + // ch
        k[i] +
        // Expand the message schedule if needed
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (let i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}
