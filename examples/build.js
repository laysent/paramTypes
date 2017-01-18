const { rollup } = require('rollup');
const babel = require('rollup-plugin-babel');
const uglify = require('uglify-js');
const fs = require('fs');
const plugin = require('./plugin').default;

rollup({
  entry: './examples/index.js',
  plugins: [
    babel({
      presets: ['es2015-rollup'],
      plugins: [[plugin, { modules: ['../index'] }]],
      babelrc: false,
    }),
  ],
})
.then(bundle => bundle.generate({ format: 'iife' }).code)
.then(code => {
  fs.writeFileSync('./examples/output.js', code);
  return code;
})
.then(code => uglify.minify(code, {
  fromString: true,
  comporess: {
    dead_code: true,
    unused: true,
  },
}).code)
.then(code => fs.writeFileSync('./examples/output.min.js', code))
.catch(console.error.bind(console));
