var gulp = require('gulp'),
    mode = require('gulp-mode'),
    git = require('gulp-git'),
    bump = require('gulp-bump');

gulp.task('version_patch', function(){
  return gulp.src(['./package.json'])
  .pipe(bump({type:'patch'}))
  .pipe(gulp.dest('./'));
});

gulp.task('pull-dev', function(){
    return git.pull("origin", "dev", {args: '--rebase'}, function(err){
      if (err) throw err;
    });
});
