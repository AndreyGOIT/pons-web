module.exports = {
    apps: [
        {
            name: "pons-api",
            script: "dist/index.js",
            instances: 1,
            autorestart: true,
            watch: false,
            env: {
                NODE_ENV: "development",
            },

            env_production: {
                NODE_ENV: "production",
                DB_TYPE: "mysql",
                PORT: 5050,
            },
        },
    ],
};