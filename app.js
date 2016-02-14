var fs = require("fs");
var browserify = require("browserify");
var babelify = require("babelify");
var extensions = ['.js', '.json', '.es6'];

browserify({
        debug: true
    })
    /*.transform(babelify.configure({
      extensions: extensions
    }))
    */
    .transform("babelify", {
        presets: ["es2015"]
    })
    .require("kelips/app.js", {
        entry: true
    })
    .bundle()
    .on("error", function(err) {
        console.log("Error: " + err.message);
    })
    .pipe(fs.createWriteStream("bundle.js"));


browserify({
        debug: true
    })
    /*.transform(babelify.configure({
      extensions: extensions
    }))
    */
    .transform("babelify", {
        presets: ["es2015"]
    })
    .require("kelips/setup.js", {
        entry: true
    })
    .bundle()
    .on("error", function(err) {
        console.log("Error: " + err.message);
    })
    .pipe(fs.createWriteStream("setup.js"));
