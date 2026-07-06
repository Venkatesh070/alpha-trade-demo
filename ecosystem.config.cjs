/** PM2 config — run from project root: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "alpha-trade",
      cwd: __dirname,
      script: "npm",
      args: "start",
      env_file: ".env",
      watch: false,
    },
  ],
};
