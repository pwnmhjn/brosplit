const checkReqBody = <T extends object>(
  obj: T
): { isThere: boolean; missingKey?: string } => {
  for (const key in obj) {
    if (
      obj[key] === undefined ||
      obj[key] === null ||
      (typeof obj[key] === 'string' && obj[key].trim() === '')
    ) {
      return { isThere: false, missingKey: key };
    }
  }
  return { isThere: true };
};

export { checkReqBody };
