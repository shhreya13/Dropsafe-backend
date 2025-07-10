exports.generateMaskedName = () => `user${Math.floor(Math.random() * 1000)}`;
exports.generateProxyPhone = () => `+91-98XX-XX${Math.floor(1000 + Math.random() * 9000)}`;
exports.logEvent = (msg) => {
  console.log(`[${new Date().toISOString()}] ${msg}`);
};
