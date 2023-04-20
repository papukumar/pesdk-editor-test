// Common Webpack configuration used by webpack.config.development and webpack.config.production

const path = require("path");
const webpack = require("webpack");
const config = require("config");
process.env["NODE_CONFIG_DIR"] = __dirname + "/buildConfig/";
const host = config.get("host") || "/";
const paths = require("./paths");

const isEnvDevelopment = process.env.NODE_ENV === "development";
const isEnvProduction = process.env.NODE_ENV === "production";

module.exports = {
  target: ["web", "es5"],
  stats: {
    children: true,
  },
  cache: {
    type: "filesystem",
  },
  // These are the "entry points" to our application.
  // This means they will be the "root" imports that are included in JS bundle.
  entry: paths.appIndexJs,
  output: {
    // The build folder.
    path: paths.appBuild,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: isEnvDevelopment,
    // There will be one main bundle, and one file per asynchronous chunk.
    // In development, it does not produce real files.
    filename: isEnvProduction
      ? "static/js/[name].[contenthash:8].js"
      : isEnvDevelopment && "static/js/bundle.js",
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: isEnvProduction
      ? "static/js/[name].[contenthash:8].chunk.js"
      : isEnvDevelopment && "static/js/[name].chunk.js",
    assetModuleFilename: "static/media/[name].[hash][ext]",
    // webpack uses `publicPath` to determine where the app is being served from.
    // It requires a trailing slash, or the file assets will get an incorrect path.
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: paths.publicUrlOrPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: isEnvProduction
      ? (info) =>
          path
            .relative(paths.appSrc, info.absoluteResourcePath)
            .replace(/\\/g, "/")
      : isEnvDevelopment &&
        ((info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, "/")),
  },
  resolve: {
    modules: [path.join(__dirname, "../src"), "node_modules"],
    mainFiles: ["index"], // for resolving directories mentioned in import paths to index.js files
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".scss", ".css"],
    fallback: {
      crypto: false,
      stream: false,
      constants: false,
    },
  },
  plugins: [
    new webpack.ProvidePlugin({}),
    new webpack.DefinePlugin({
      __APIURL__: JSON.stringify(config.get("apiUrl")),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        //include: [path.resolve(__dirname, "../src/app")],
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            cacheCompression: false,
            cacheDirectory: true,
            // "plugins": ["lodash"]
          },
        },
      },
      // for TS files
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheCompression: false,
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
              name: "images/[path][name].[ext]?[fullhash]",
              publicPath: host,
            },
          },
        ],
      },
      // Fonts
      {
        test: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 8192,
            name: "fonts/[name].[ext]?[fullhash]",
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        commons: {
          chunks: "all",

          minChunks: 2,
          maxInitialRequests: 5, // The default limit is too small to showcase the effect
          minSize: 0, // This is example is too small to create commons chunks
        },
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          priority: 10,
          enforce: true,
        },
      },
    },
  },
};
