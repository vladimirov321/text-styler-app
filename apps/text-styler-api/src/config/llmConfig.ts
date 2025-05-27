export const llmConfig = {
  models: {
    textImprovement: 'gpt-4.1-nano',
  },
  defaultTemperature: 0.7,
  cacheOptions: {
    ttl: 3600,
    checkPeriod: 600,
    maxKeys: 1000
  }
};
