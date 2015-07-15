// Set up plugins and project variables
var
    // First, we need Gulp
    gulp           = require('gulp'),
    // gulp-load-plugins helps keep things a little less verbose.
    $              = require('gulp-load-plugins')(),
    // BrowserSync
    browserSync    = require('browser-sync'),
    reload         = browserSync.reload,
    // Set environment variable
    production     = true,
    // Only masochists write vendor prefixes
    prefixes       = ['last 2 version', 'safari 5', 'ie 8', 'opera 12.1', 'ios 6', 'android 4', 'Firefox >= 4'],
    // Keep that CSS nice and tight
    cssStyle       = "compressed",
    // Project-specific variables for demonstration
    projectA       = false,
    projectB       = false,
    projectC       = false,
    projectApaths  = false,
    projectBpaths  = false,
    projectCpaths  = false;

//
// gulp --dev
if ($.util.env.dev === true) {
  // Change the CSS output to nested for easier readability
  cssStyle   = "nested";
  production = false;
}

//
// gulp --projectA
// This flag toggles some variables and makes lets us change the CSS output
if ($.util.env.projectA === true) {
  // Set this variable to true
  projectA    = true,
  // Make sure the CSS output is compressed
  cssStyle   = "compressed",
  // Add some new paths if the flag is activated
  projectApaths = require("./paths/paths-projectA.json");
}

//
// gulp --projectB
// All the same as projectA
if ($.util.env.projectB === true) {
  projectB    = true,
  cssStyle   = "compressed",
  projectBpaths = require("./paths/paths-projectB.json");
}

//
// gulp --projectC
// All the same as projectA
if ($.util.env.projectC === true) {
  projectC    = true,
  cssStyle   = "compressed",
  projectCpaths = require("./paths/paths-projectC.json");
}

//
//  Set up some project paths
var paths = {
  // Pattern Lab's Mustache templates
  patterns: "source/_patterns/**/*.mustache",
  // Pattern Lab's data files
  data: "source/**/*.json",
  // SCSS paths—where they start and where they end up in Pattern Lab
  styles: {
         src: ["source/css/**/*.scss"],
        dest: "public/css",
    // If you had any of the project flags activated, these paths will load conditionally from an external file. Due to possible differences in local development environments you may not necessarily want this in source control. I share it in my project's Readme, in a Gist or on the team wiki
    projectA: projectApaths.styles,
    projectB: projectBpaths.styles,
    projectC: projectCpaths.styles
  }
};

//
// Compile styles
gulp.task('styles', function() {
  // Path to watch for changes to your Sass
  gulp.src(paths.styles.src)
    // Set up Sass sourcemaps
    .pipe($.sourcemaps.init())
    // How big are these files—just useful information
    .pipe($.size())
    // Sass go!
    .pipe($.sass({
      // Compressed or Nested output, based on variables set above or modified by runtime flags
      outputStyle: cssStyle,
      // gulp-util helps us out again by helping us get useful and pretty error messages.
      onError: function(error) {
        $.util.beep();
        $.util.log("\n\n[" + $.util.colors.green("gulp-sass") +"]\n" + $.util.colors.cyan(error.message) + " on " + $.util.colors.yellow("line " + error.line) + " in\n" + error.file);
      }
    }))
    // Apply vendor prefixed based on settings above
    .pipe($.autoprefixer(prefixes))
    // Write the sourcemap
    .pipe($.sourcemaps.write("."))
    // Send sourcemaps and CSS files to destination directory
    .pipe(gulp.dest(paths.styles.dest))

    // Send sourcemaps and CSS files to project directory if we ran Gulp with appropriate flags
    .pipe(projectA ? gulp.dest(paths.styles.projectA) : $.util.noop())
    .pipe(projectB ? gulp.dest(paths.styles.projectB) : $.util.noop())
    .pipe(projectC ? gulp.dest(paths.styles.projectC) : $.util.noop())

    // If CSS files were changed…
    .pipe($.filter('*.css'))
    // …then reload any browsers connected via BrowserSync
    .pipe(reload({ stream: true }));
});

//
// BrowserSync
// Turn on some settings for BrowserSync
gulp.task("browserSync", function() {
  browserSync({
    ui: {
      // Connect to localhost:8080 for BrowserSync UI
      port: 8080
    },
    server: {
      // Serve out of Pattern Lab's public directory
      baseDir: "public"
    },
    // Turn on all the fun synced stuff
    ghostMode: {
      clicks: true,
      scroll: true,
      links: true,
      forms: true
    },
    debugInfo: true
  });
});


//
// BrowserSync Reload
// Just a helper for BrowserSync
gulp.task('reload', function () {
  reload();
});

//
// Give us prettier feedback when something happens
var changeEvent = function(evt) {
  $.util.log("File", $.util.colors.cyan(evt.path.replace(new RegExp("/.*(?=/" + "/source" + ")/"), "")), "was", $.util.colors.magenta(evt.type));
};

//
// Watch
// Paths for Gulp to watch for changes and callbacks
gulp.task('watch', ['styles', 'browserSync'], function() {
  gulp.watch(paths.styles.src, ['styles']).on('change',
  // Tell us what changed
  function(evt) {
    changeEvent(evt);
  });
  gulp.watch(paths.patterns, ['reload']).on('change', function(evt) {
    changeEvent(evt);
  });
  gulp.watch(paths.data, ['reload']).on('change', function(evt) {
    changeEvent(evt);
  });
});

// Default
// This is what happens when you just type `gulp` into your terminal.
// You could override it by following it up with an individual task, like `gulp styles`
gulp.task('default', ['watch']);
