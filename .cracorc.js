module.exports = {
  reactScriptsVersion: "react-scripts" /* (default value) */,
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    return {
      ...devServerConfig,
      hot: true,
      proxy: [
        {
          context: ["/"],
          target: process.env.REACT_APP_BASE_API,
          changeOrigin: true,
        },
      ],
      historyApiFallback: true,
    };
  }
};
