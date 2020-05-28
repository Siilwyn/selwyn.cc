'use strict';

const gulp = require('gulp');
const path = require('path');

const markdown = require('gulp-markdown');
const matter = require('front-matter');
const mustache = require('gulp-mustache');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const image = require('gulp-image');
const rename = require('gulp-rename');
const tap = require('gulp-tap');

const autoprefixer = require('autoprefixer');
const customProperties = require('postcss-custom-properties');
const cssImport = require('postcss-import');
const cssClean = require('postcss-clean');
const customMedia = require('postcss-custom-media');
const declarationSorter = require('css-declaration-sorter');
const pseudoClassEnter = require('postcss-pseudo-class-enter');

const server = require('browser-sync').create();

const paths = {
  html: {
    src: './src/views/*.mustache',
    partials: './src/partials/**/*.mustache',
    dist: './dist/',
  },
  css: {
    src: ['./src/partials/**/**/*.css', './src/views/*.css'],
    dist: './dist/css/',
  },
  js: {
    src: './src/partials/**/*.js',
    dist: './dist/js',
  },
  media: {
    src: './src/assets/media/*.{svg,png,jpg,gif,mp4}',
    dist: './dist/assets/media',
  },
  fonts: {
    src: './src/assets/fonts/*',
    dist: './dist/assets/fonts',
  },
  writings: {
    src: './src/writings/*.md',
    template: './src/templates/writing.mustache',
    dist: './dist/writings/',
  },
  meta: {
    src: './src/meta/*',
    dist: './dist',
  },
};

gulp.task('build:html', function() {
  return gulp
    .src(paths.html.src)
    .pipe(mustache({}))
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(
      rename({
        extname: '.html',
      })
    )
    .pipe(gulp.dest(paths.html.dist))
    .pipe(server.stream());
});

gulp.task('build:css', function() {
  var cssProcessors = [
    cssImport(),
    customProperties({
      importFrom: './src/partials/core/styles/variables.css',
    }),
    customMedia({
      importFrom: './src/partials/core/styles/variables.css',
    }),
    autoprefixer({
      remove: false,
    }),
    cssClean(),
    pseudoClassEnter(),
  ];

  return gulp
    .src(paths.css.src, {
      since: gulp.lastRun('build:css'),
    })
    .pipe(postcss(cssProcessors))
    .pipe(
      rename({
        dirname: '',
      })
    )
    .pipe(gulp.dest(paths.css.dist))
    .pipe(server.stream());
});

gulp.task('build:js', function() {
  return gulp
    .src(paths.js.src, {
      since: gulp.lastRun('build:js'),
    })
    .pipe(
      rename({
        dirname: '',
      })
    )
    .pipe(gulp.dest(paths.js.dist));
});

gulp.task('build:media', function() {
  return gulp
    .src(paths.media.src, {
      since: gulp.lastRun('build:media'),
    })
    .pipe(image({ concurrent: 1 }))
    .pipe(gulp.dest(paths.media.dist));
});

gulp.task('build:fonts', function() {
  return gulp
    .src(paths.fonts.src, {
      since: gulp.lastRun('build:fonts'),
    })
    .pipe(gulp.dest(paths.fonts.dist));
});

gulp.task('build:meta', function() {
  return gulp
    .src(paths.meta.src, {
      since: gulp.lastRun('build:meta'),
    })
    .pipe(gulp.dest(paths.meta.dist));
});

gulp.task('build:writings', function() {
  return gulp
    .src(paths.writings.src)
    .pipe(
      tap(function(file) {
        const parsedContents = matter(String(file.contents));
        file.contents = Buffer.from(parsedContents.body);
        file.attributes = parsedContents.attributes;
      })
    )
    .pipe(markdown())
    .pipe(
      tap(function(file, t) {
        const filePath = path.parse(file.path);

        return gulp
          .src(paths.writings.template)
          .pipe(
            mustache(
              file.attributes,
              {},
              {
                'writing-content': String(file.contents),
                slug: filePath.name,
              }
            )
          )
          .pipe(
            htmlmin({
              collapseWhitespace: true,
            })
          )
          .pipe(
            rename({
              basename: filePath.base,
              extname: '',
            })
          )
          .pipe(gulp.dest(paths.writings.dist))
          .pipe(server.stream());
      })
    );
});

gulp.task(
  'build',
  gulp.parallel([
    'build:html',
    'build:css',
    'build:js',
    'build:media',
    'build:fonts',
    'build:meta',
    'build:writings',
  ])
);

gulp.task('watch:html', function(done) {
  gulp.watch(
    [paths.html.src, paths.html.partials, paths.js.src],
    gulp.task('build:html')
  );
  done();
});

gulp.task('watch:css', function(done) {
  gulp.watch(paths.css.src, gulp.task('build:css'));
  done();
});

gulp.task('watch:js', function(done) {
  gulp.watch(paths.js.src, gulp.task('build:js'));
  done();
});

gulp.task('watch:media', function(done) {
  gulp.watch(paths.media.src, gulp.task('build:media'));
  done();
});

gulp.task('watch:writings', function(done) {
  gulp.watch(
    [paths.writings.src, paths.html.partials, paths.js.src],
    gulp.task('build:writings')
  );
  done();
});

gulp.task(
  'watch',
  gulp.parallel([
    'watch:html',
    'watch:css',
    'watch:js',
    'watch:media',
    'watch:writings',
  ])
);

gulp.task('format:css', function() {
  return gulp
    .src(paths.css.src, {
      since: gulp.lastRun('build:css'),
      base: './',
    })
    .pipe(
      postcss([
        declarationSorter({
          order: 'smacss',
        }),
      ])
    )
    .pipe(gulp.dest('.'));
});

gulp.task('format', gulp.parallel(['format:css']));

gulp.task('server', function(done) {
  server.init({
    server: {
      baseDir: './dist/',
      serveStaticOptions: {
        extensions: ['html'],
      },
    },
    browser: 'chromium-browser',
  });

  done();
});

gulp.task(
  'default',
  gulp.parallel('server', gulp.series('format', 'build', 'watch'))
);
