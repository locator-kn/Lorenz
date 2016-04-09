const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const tscConfig = require('./tsconfig.json');
const tslint = require('gulp-tslint');
const webserver = require('gulp-webserver');
const watch = require('gulp-watch');
const KarmaServer = require('karma').Server;
const shell = require('gulp-shell');
const fs = require('fs');
const env = JSON.parse(fs.readFileSync('./env.json', 'utf-8'));

gulp.task('clean', function () {
    return del('dist/**/*');
});

gulp.task('ts', function () {
    return gulp
        .src('app/**/*.ts')
        .pipe(typescript(tscConfig.compilerOptions))
        .pipe(gulp.dest('dist'));
});

gulp.task('html', function () {
    return gulp.src('app/**/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
    return gulp.src('app/**/*.css')
        .pipe(gulp.dest('dist'));
});

gulp.task('web', function () {
    gulp.src('./')
        .pipe(webserver({
            livereload: false,
            open: true
        }));
});

gulp.task('watch', ['build', 'web'], function () {
    gulp.watch('app/**/*.ts', ['ts']);
    gulp.watch('app/**/*.css', ['css']);
    gulp.watch('app/**/*.html', ['html']);
});

gulp.task('test', ['build'], function (done) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function () {
        done();
    }).start();
});

gulp.task('deploy', shell.task([
    'rm -rf Locator-darwin-x64',
    'electron-packager . Locator --platform=darwin --arch=x64 --ignore "node_modules/remap-istanbul" --ignore "node_modules/gulp-*" --ignore "node_modules/http-server" --ignore "node_modules/karma-*" --ignore "node_modules/electron-*" --ignore "node_modules/jasmine-*" --ignore "node_modules/lite-server" --overwrite',
    'codesign --deep --force --verbose --sign ' + env.identity + ' Locator-darwin-x64/Locator.app',
    'electron-release --app Locator-darwin-x64/Locator.app --token ' + env.token + ' --repo locator-kn/dashboard'
]));


gulp.task('build', ['html', 'ts', 'css']);
gulp.task('default', ['build']);
