module.exports = {
  apps: [
    {
      name: "pons-api",
      script: "dist/index.js",
      cwd: "./backend",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
