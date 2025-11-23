export const getEnv = (key: string, defaultValue: string = ""): string => {
  const val = process.env[key] ?? defaultValue;
  if (!val) throw new Error(`Environment variable ${key} is not set`);
  return val;
};
