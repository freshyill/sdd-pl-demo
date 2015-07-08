var gulp           = require('gulp'),
    $              = require('gulp-load-plugins')(),
    browserSync    = require('browser-sync'),
    reload         = browserSync.reload,
    production     = true,
    prefixes       = ['last 2 version', 'safari 5', 'ie 8', 'opera 12.1', 'ios 6', 'android 4', 'Firefox >= 4'],
    cssStyle       = "compressed",
    projectA       = false,
    projectB       = false,
    projectC       = false,
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

if ($.util.env.projectC === true) {
  projectC    = true,
  cssStyle   = "compressed",
  projectCpaths = require("./paths/paths-projectC.json");
}


var paths = {
  patterns: "source/_patterns/**/*.{mustache,json}",
  data: "source/**/*.json",
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
gulp.task('watch', ['styles', 'browserSync'], function() {
  gulp.watch(paths.styles.src, ['styles']).on('change', function(evt) {
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
gulp.task('default', ['watch']);
