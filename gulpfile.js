var gulp = require('gulp'),
    mode = require('gulp-mode'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    apidoc = require('gulp-apidoc'),
    promise = require("promise"),
    argv = require("yargs").argv;

const versionPatch = (done)=>{
  return gulp.src(['./package.json'])
  .pipe(bump({type:'patch'}))
  .pipe(gulp.dest('./'));
};

const pullDev = async()=>{
   return git.pull("origin", "dev", {args: '--rebase'}, function(err){
    if (err) throw err;
  });
}

const pushDev = async(done)=>{
  await git.push('origin', 'dev', function (err) {
    if (err) throw err;
  });
  done();
}

const updateApiDoc = async(done)=>{
  return apidoc({
    src: "./routes/",
    dest: "./doc/",
    config: "./"
  },done);
}

const commitPackageFile = ()=>{
  return gulp.src(['./package.json','./package-lock.json'])
    .pipe(git.commit('update version'));
}

exports.deploy = gulp.series(versionPatch,updateApiDoc);
