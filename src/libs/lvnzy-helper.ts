export const nestedPropertyAccessor = (
  record: any,
  keys: string | string[]
) => {
  if (Array.isArray(keys)) {
    return keys.reduce(
      (obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined),
      record
    );
  } else {
    return record[keys];
  }
};

export const rupeeAmountFormat = (amt: string) => {
  const amtNum = parseInt(amt);
  if (!amtNum || isNaN(amtNum)) {
    return amt;
  }
  const val = Math.abs(amtNum);
  if (val >= 10000000) return `${(amtNum / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `${(amtNum / 100000).toFixed(2)} Lac`;
  return amtNum;
};
