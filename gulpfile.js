var gulp           = require('gulp'),
    $              = require('gulp-load-plugins')(),
    browserSync    = require('browser-sync'),
    pngquant       = require('imagemin-pngquant'),
    reload         = browserSync.reload,
    production     = true,
    prefixes       = ['last 2 version', 'safari 5', 'ie 8', 'opera 12.1', 'ios 6', 'android 4', 'Firefox >= 4'],
    cssStyle       = "compressed",
    projectA       = false,
    projectB       = false,
    projectC       = false,
    jcore          = false,
    projectApaths  = false,
    projectBpaths  = false,
    projectCpaths  = false;

var changeEvent = function(evt) {
  $.util.log("File", $.util.colors.cyan(evt.path.replace(new RegExp("/.*(?=/" + "/source" + ")/"), "")), "was", $.util.colors.magenta(evt.type));
};

if ($.util.env.dev === true) {
  cssStyle   = "nested";
}

if ($.util.env.projectA === true) {
  projectA    = true,
  cssStyle   = "compressed",
  projectApaths = require("./paths/paths-projectA.json");
}

if ($.util.env.projectB === true) {
  projectB    = true,
  cssStyle   = "compressed",
  projectBpaths = require("./paths/paths-projectB.json");
}

if ($.util.env.projectc === true) {
  projectC    = true,
  cssStyle   = "compressed",
  projectCpaths = require("./paths/paths-projectC.json");
}


var paths = {
  patterns: "source/_patterns/**/*.{mustache,json}",
  images: {
      src: "source/images/**/*.{jpg,jpeg,png,gif,svg}",
     dest: "public/images/",
    // theme: themePaths.images
    // Do we want to automate this? Our themes are pretty light on the images,
    // so probably not, right?
  },
  scripts: {
      src: "source/js/**/*.js",
     skip: "!source/js/lib/modernizr.js",
     dest: "public/js/",
    // theme: themePaths.scripts
    // We don't want to just dump everything into our themes, so we're not going
    // to automate this right now.
  },
  styles: {
         src: ["source/css/**/*.scss"],
        dest: "public/css",
    projectA: projectApaths.styles,
    projectB: projectBpaths.styles,
    projectC: projectCpaths.styles
  }
};

gulp.task('styles', function() {
  gulp.src(paths.styles.src)
    .pipe($.sourcemaps.init())
    .pipe($.size())
    .pipe($.sass({
      outputStyle: cssStyle,
      onError: function(error) {
        $.util.beep();
        $.util.log("\n\n[" + $.util.colors.green("gulp-sass") +"]\n" + $.util.colors.cyan(error.message) + " on " + $.util.colors.yellow("line " + error.line) + " in\n" + error.file);
      }
    }))
    .pipe($.autoprefixer(prefixes))
    .pipe($.sourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.dest))

    //.pipe(projectA ? $.replace("../../images", "../images") : $.util.noop())
    //.pipe(projectA ? $.replace("../../fonts", "../fonts") : $.util.noop())
    //.pipe(projectA ? $.filter(['*sciencecore*', '*fonts*']) : $.util.noop())
    .pipe(projectA ? gulp.dest(paths.styles.projectA) : $.util.noop())
    .pipe(projectB ? gulp.dest(paths.styles.projectB) : $.util.noop())
    .pipe(projectC ? gulp.dest(paths.styles.projectC) : $.util.noop())

    .pipe($.filter('*.css'))
    .pipe(reload({ stream: true }));

});

//
// Images
//
gulp.task("images", function() {
  gulp.src(paths.images.src)
    .pipe($.changed(paths.images.dest))
    .pipe($.using())
    .pipe($.size())
    .pipe($.imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
              use: [pngquant()]
    }))
    .pipe(gulp.dest(paths.images.dest));
});

//
// BrowserSync
//
gulp.task("browserSync", function() {
  browserSync({
    ui: {
      port: 8080
    },
    server: {
      baseDir: "public"
    },
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
//
gulp.task('reload', function () {
  reload();
});

//
// Watch
//
gulp.task('watch', ['styles', 'images', 'browserSync'], function() {
  gulp.watch(paths.styles.src, ['styles']).on('change', function(evt) {
    changeEvent(evt);
  });
  gulp.watch(paths.images.src, ['images']).on('change', function(evt) {
    changeEvent(evt);
  });
  gulp.watch(paths.patterns, ['reload']).on('change', function(evt) {
    changeEvent(evt);
  });
});

// Default
gulp.task('default', ['watch']);
