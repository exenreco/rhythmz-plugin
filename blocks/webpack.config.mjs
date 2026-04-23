import path from 'path';
import fg from 'fast-glob';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import DependencyExtractionWebpackPlugin from '@wordpress/dependency-extraction-webpack-plugin';

const
__filename = fileURLToPath(import.meta.url),
__dirname = path.dirname(__filename);

// Function to dynamically generate Webpack entries
function generateEntries() {
  const entries = {};
  const files = fg.sync([
    './src/*/index.js', 
    './src/*/index.mjs',
    './src/*/js/**/*.js',
    './src/*/js/**/*.mjs', 
    './src/*/js/**/*.jsx',
    './src/*/libs/**/*.js',
    './src/*/libs/**/*.mjs',
    './src/*/libs/**/*.jsx',
  ], { cwd: __dirname });

  files.forEach(file => {
    const relativePath = path.relative('./src', file);
    const dirname = path.dirname(relativePath);
    const basename = path.basename(relativePath, path.extname(relativePath));
    
    // Group by directory, but ensure unique names
    let entryName;
    if (dirname === basename) {
      // This is an index file in a block root
      entryName = `${dirname}/index`;
    } else {
      // This is a file in a subdirectory
      entryName = `${dirname}/${basename}`;
    }
    
    entries[entryName] = `./${file}`;
  });

  return entries;
}

export default {
  mode: "development", // or 'production'
  entry: generateEntries(),
  output: {
    filename: "[name].js", // always emit .js for browser
    path: path.resolve(__dirname, "build"),
    clean: true,
    environment: {
      arrowFunction: false,
      const: false,
      destructuring: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "webfonts/[name][ext]",
          publicPath: "webfonts/",
        },
      },
      {
        test: /\.(svg)$/i,
        type: "asset/resource",
        generator: { filename: "assets/icons/[name][ext]" },
      },
      {
        test: /\.scss$/i,
        use: [
          //MiniCssExtractPlugin.loader,
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {},
          },
        ],
      },
      {
        test: /\.(mjs|js|jsx)$/, // include .mjs
        // exclude node_modules, but if you need to transpile specific packages
        // use exclude: /node_modules\/(?!(some-es-package)\/).*/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              // IMPORTANT: tell babel NOT to transform modules (webpack handles them)
              [
                "@babel/preset-env",
                {
                  targets: { browsers: ["last 2 versions", "ie >= 11"] },
                  modules: false,
                },
              ],
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
            plugins: [
              // Add this if you need to support dynamic imports
              "@babel/plugin-syntax-dynamic-import",
            ],
          },
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "build"),
    },
    compress: true,
    port: 9000,
    open: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name]/css/[name].css",
    }),
    new CopyPlugin({
      patterns: [
        { from: "**/*.php", to: "[path][name][ext]", context: "src" },
        { from: "**/css/**", to: "[path][name][ext]", context: "src" },
        //{ from: '**/js/**', to: '[path][name][ext]', context: 'src', },
        //{ from: '**/libs/**', to: '[path][name][ext]', context: 'src', },
        { from: "**/block.json", to: "[path][name][ext]", context: "src" },
        { from: "blocks.json", to: "[path][name][ext]", context: "src" },
      ],
    }),
    new DependencyExtractionWebpackPlugin({ injectPolyfill: true }),
  ],
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".json", ".scss", ".css"],
  },
  // You might want to add performance hints or optimization settings
  // performance: {
  //   hints: false,
  // },
  // optimization: {
  //   minimize: process.env.NODE_ENV === 'production',
  //   // ... other optimization options
  // },
};
