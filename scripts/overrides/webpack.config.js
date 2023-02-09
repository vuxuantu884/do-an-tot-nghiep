const webpackConfigPath = "react-scripts/config/webpack.config";
const webpackConfig = require(webpackConfigPath);
const override = (config) => {
  const ruleIndex = config.module.rules[0].hasOwnProperty("oneOf") ? 0 : 1;
  config.module.rules[`${ruleIndex}`].oneOf.unshift({
    test: /\.less$/,
    use: [
      {
        loader: "style-loader",
      },
      {
        loader: "css-loader", // translates CSS into CommonJS
      },
      {
        loader: "less-loader", // compiles Less to CSS
        options: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    ],
  });
  return config;
};

require.cache[require.resolve(webpackConfigPath)].exports = (env) => override(webpackConfig(env));

module.exports = require(webpackConfigPath);
