const path = require("path");
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const baseWebpackConfig = require("./webpack.config.base");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const config = require("config");
const paths = require("./paths");
const sourceMapType = config.get("sourceMapType");

const CleanObsoleteChunks = require("webpack-clean-obsolete-chunks");

console.log("Environment is : ", process.env.NODE_ENV);
console.log("app will build at:" + config.get("appPath"));
console.log("SourceMapType: ", sourceMapType);

const GLOBALS = {
  process: {
    env: {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
    browser: JSON.stringify(true),
    title: JSON.stringify("browser"),
  },
  __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || "false")),
  __STUBS__: false,
};

module.exports = (env = {}) => {
  const isEnvDevelopment = process.env.NODE_ENV === "development";

  const productionWebpackConfig = {
    mode: isEnvDevelopment ? "development" : "production",
    devtool: sourceMapType,
  };
  const plugins = [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin(GLOBALS),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new MiniCssExtractPlugin({
      filename: "css/app.[contenthash].min.css",
      ignoreOrder: true,
    }),
  ];

  if (env.noUglify) {
    console.log(
      "\n********  This is demo build - to be used in local environment only *******\n"
    );
    plugins.push(
      new webpack.ids.HashedModuleIdsPlugin(),
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          }
        )
      ),
      new CleanObsoleteChunks({
        verbose: true,
        deep: true,
      })
    );
  } else {
    console.log(
      "\n******** This is actual prod build - to be deployed on demo and prod environment ********\n"
    );
    plugins.push(
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(js|html|css)$/,
      }),

      new webpack.ids.HashedModuleIdsPlugin(),

      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          },
          {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true,
            },
          }
        )
      )
    );

    Object.assign(productionWebpackConfig, {
      optimization: {
        minimizer: [
          new UglifyJsPlugin({
            exclude: "prefetchSW.js",
            cache: true,
            parallel: true,
            uglifyOptions: {
              warnings: false,
              output: {
                comments: false,
              },
            },
            chunkFilter: (chunk) => {
              // Exclude uglification for the these chunks
              if (
                chunk.name === "vendor" ||
                chunk.name === "application" ||
                chunk.name === "extras" ||
                chunk.name === "prefetchSW"
              ) {
                return false;
              }
              return true;
            },
          }),
        ],
      },
    });
  }

  Object.assign(productionWebpackConfig, {
    plugins,
    module: {
      rules: [
        {
          test: /\.scss$/,
          include: [path.resolve(__dirname, "../src")],
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
                modules: true,
                importLoaders: 2,
                context: __dirname,
                localIdentName: "[name]__[local]__[hash:base64:5]",
              },
            },
            {
              loader: "resolve-url-loader",
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: true,
                plugins: () => [
                  require("autoprefixer")({
                    browsers: ["last 2 versions"],
                  }),
                  require("cssnano")({
                    zindex: false,
                    reduceIdents: {
                      keyframes: false,
                    },
                  }),
                ],
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
    externals: {
      recurly: "recurly",
    },
  });

  return merge(baseWebpackConfig, productionWebpackConfig);
};
