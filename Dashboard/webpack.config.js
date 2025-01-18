const path = require('path');

module.exports = {
  // Entry point for your application
  entry: './src/index.js', // Update this to your app's main file
  
  // Output configuration
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output file name
  },

  // Development mode for readable output
  mode: 'development', // Change to 'production' for minified builds

  // Loaders for handling different file types
  module: {
    rules: [
      {
        test: /\.js$/, // Process all .js files
        exclude: /node_modules/, // Exclude dependencies
        use: {
          loader: 'babel-loader', // Use Babel for transpilation
        },
      },
      {
        test: /\.css$/, // Process CSS files
        use: ['style-loader', 'css-loader'], // Apply these loaders
      },
    ],
  },

  // Optional: Source maps for debugging
  devtool: 'source-map',

  // Dev server configuration
  devServer: {
    contentBase: path.join(__dirname, 'dist'), // Serve files from 'dist'
    compress: true, // Enable gzip compression
    port: 9000, // Default port
  },
};