import path from "path";
import { fileURLToPath } from "url";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/handler.ts",
  target: "node18",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"],
    plugins: [new TsconfigPathsPlugin()]
  },
  output: {
    filename: "handler.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs2"
  }
};