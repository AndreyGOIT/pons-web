module.exports = {
    apps: [
        {
            name: "pons-api",
            script: "dist/index.js",
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: "200M",

            env: {
                NODE_ENV: "development",
            },

            env_production: {
                NODE_ENV: "production",

                DB_TYPE: "mysql",
                DB_HOST: "d141489.mysql.zonevs.eu",
                DB_USER: "d141489sa557528",
                DB_PASSWORD: "xonjur-3rUwcy-qevrob",
                DB_NAME: "d141489_sd611306",
                DB_PORT: 3306,

                PORT: 5050,
            },
        },
    ],
};