module.exports = {
  apps: [
    {
      name: "calorie-api",
      script: "./dist/server.js",
      node_args: "--max-old-space-size=400",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        MONGODB_URI:
          "mongodb+srv://adamaviv93_db_user:JeF9MmzCyPTstgb5@main-cluster.9vydytk.mongodb.net/calorie-calculator?appName=main-cluster",
      },
    },
  ],
};
