import { schema, TokenInfo, TokenList } from "@uniswap/token-lists";
import Ajv from "ajv";
import addFormats from "ajv-formats";

export const validate = async (builtList: Object) => {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const valid = validate(builtList);
  if (valid) {
    const tokenList = (builtList as unknown) as TokenList;

    validateUnderlyingTokens(tokenList);
    validateTokenUniqueness(tokenList);

    return valid;
  }
  if (validate.errors) {
    throw validate.errors.map((error) => {
      delete error.data;

      return error;
    });
  }
};

export const validateUnderlyingTokens = (tokenList: TokenList) => {
  const errors: string[] = [];

  tokenList.tokens.forEach((token) => {
    if (token.extensions && token.extensions.superTokenInfo) {
      const superTokenInfo = token.extensions.superTokenInfo as Record<
        "type" | "underlyingTokenAddress",
        string
      >;
      if (superTokenInfo.underlyingTokenAddress) {
        const underlyingToken = tokenList.tokens.find(
          (t) =>
            t.address.toLowerCase() ===
            superTokenInfo.underlyingTokenAddress.toLowerCase()
        );
        if (!underlyingToken) {
          errors.push(
            `Underlying token of ${token.symbol}: ${superTokenInfo.underlyingTokenAddress} not found in token-list.`
          );
        }
      }
    }
  });

  if (errors.length === 0) {
    return true;
  }

  throw errors.map((error) => {
    return error;
  });
};

export const validateTokenUniqueness = (tokenList: TokenList) => {
  const addressMap: { [chainId: number]: { [address: string]: TokenInfo } } = {};
  const errors: string[] = [];

  tokenList.tokens.forEach((token) => {
    if (!addressMap[token.chainId]) {
      addressMap[token.chainId] = {};
    }

    const lowercaseAddress = token.address.toLowerCase();
    if (addressMap[token.chainId][lowercaseAddress]) {
      errors.push(`Duplicate token found: ${token.symbol} (${token.address}) on chain ${token.chainId}`);
    } else {
      addressMap[token.chainId][lowercaseAddress] = token;
    }
  });

  if (errors.length === 0) {
    return true;
  }

  throw errors;
};
