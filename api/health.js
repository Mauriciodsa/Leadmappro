module.exports = function handler(_req, res) {
  res.status(200).json({
    ok: true,
    platform: 'vercel',
    aiModuleEnabled: process.env.AI_MODULE_ENABLED !== 'false',
  });
};
