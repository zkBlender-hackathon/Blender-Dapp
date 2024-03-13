// const path = require("path");

// module.exports = {
//   mode: "none",
//   entry: "./src/index.ts",
//   target: "node",
//   output: {
//     library: "mixerswap-helper-sdk",
//     libraryTarget: "umd",
//     path: path.resolve(__dirname, "umd"),
//     filename: "index.js",
//     globalObject: "this",
//   },

//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         exclude: /node_modules/,
//         use: {
//           loader: "babel-loader",
//           options: {
//             presets: [
//               "@babel/preset-typescript",
//               [
//                 "@babel/preset-env",
//                 {
//                   targets: {
//                     esmodules: true,
//                   },
//                 },
//               ],
//             ],
//           },
//         },
//       },
//     ],
//   },
//   externals: ["decimal.js", "ethers"],
//   resolve: {
//     extensions: [".ts", ".js", ".json"],
//     fallback: {
//       crypto: require.resolve("crypto-browserify"),
//     },
//   },
// };

const path = require("path");

module.exports = {
  mode: "none",
  entry: "./index.ts",
  target: "node",
  output: {
    library: "mixerswap-helper-sdk",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "umd"),
    filename: "index.js",
    globalObject: "this",
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
        },
      },
    ],
  },
  externals: ["decimal.js", "ethers"],
  resolve: {
    extensions: [".ts", ".js", ".json"],
    fallback: {
      crypto: false,
    },
  },
};
