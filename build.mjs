// Copyright (c) 2014,2020 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html
//
// Contributors:
// Eamonn O'Brien-Strain e@obrain.com - initial author

import { dirname } from 'path'

const BUCKET = 'www.supersekrit.com'
const REGION = 'us-west-1'

const AWWW = 'android/assets/www'
const DEPLOY_FILES = ['index.html', 'index.css', 'combined.js']
const rsync = c => `rsync -a $< ${c.target}`
const tsc = c => `tsc --outDir ${dirname(c.target)} $<`
const install = module => c => `cd build; npm install ${module}`
const I = [
  'img/talk_shows_on_mute_by_katie_tegtmeyer-whitened.jpg',
  'img/talk_shows_on_mute_by_katie_tegtmeyer-icon-32x32.png',
  'img/talk_shows_on_mute_by_katie_tegtmeyer-icon-60x32.jpg'
]

export default {
  build: {
    deps: DEPLOY_FILES.map(f => `deploy/${f}`)
  },

  build_android: {
    deps: DEPLOY_FILES.map(f => 'android/assets/www/${f}')
  },

  'android/bin/SuperSekrit-debug.apk': {
    deps: ['build_android'],
    exec: 'cd android && ant debug'
  },

  installed_on_emulator: {
    deps: ['android/bin/SuperSekrit-debug.apk'],
    exec: `
      adb uninstall com.supersekrit',
      adb install $<
    `
  },

  emulator: {
    exec: 'emulator -wipe-data -scale 0.6667 -avd SII'
  },

  debug: {
    deps: ['web/debug.html', 'web/index.css', 'compile']
  },

  compile: {
    deps: ['web/sekritweb.js', 'libsync']
  },

  watch: {
    deps: ['web/debug.html', 'web/index.css', 'libsync', 'types'],
    exec: 'tsc --watch --outDir web src/sekritweb.ts'
  },

  view: {
    exec: `
      (sleep 1; xdg-open http://localhost:9999/debug.html)&
      cd web
      python -m SimpleHTTPServer 9999
    `
  },

  test: {
    deps: ['compile'],
    exec: 'tsc jasmine/spec/*.ts'
  },

  tdd_view: {
    deps: ['test'],
    exec: `
    (sleep 1; xdg-open http://localhost:8888/jasmine/SpecRunner.html)&
    python -m SimpleHTTPServer 8888
    `
  },

  test_watch: {
    deps: ['libsync', 'types'],
    exec: 'tsc --watch --outDir test src/sekritweb.ts test-src/*.ts'
  },

  clean: {
    exec: 'rm -rf deploy build/node_modules web jasmine/spec/*Spec.js'
  },

  s3: {
    deps: ['cms', 'build'],
    exec: `
      git log > deploy/HISTORY.txt
      s3cmd --config=s3.config '--add-header=Cache-Control:public, max-age=3600' --acl-public --exclude=\*~ sync deploy/ s3://${BUCKET}
      : view website at http://s3-${REGION}.amazonaws.com/${BUCKET}
    `
  },

  firebase: {
    deps: ['build'],
    exec: 'firebase deploy'
  },

  /// /////////////////////////////////////////////////////////////////////

  cms: {
    deps: ['doc/s3.config'],
    exec: `
      cd doc
      npx bajel deploy
    `
  },

  's3.config': [
    c => console.log(`
    Go key Access Key ID and Secret Access Key go to
	https://portal.aws.amazon.com/gp/aws/securityCredentials
	`),
    c => `s3cmd --config=${c.target} --configure`],

  'doc/s3.config': ['s3.config',
    c => `cp s3.config ${c.target}`],

  'web/index.css': ['src/index.css',
    rsync],
  'deploy/index.css': ['src/index.css',
    rsync],
  'android/assets/www/index.css': ['src/index.css',
    rsync],

  'web/sekritweb.js': ['src/sekritweb.ts', 'types',
    tsc],

  types: [
    'build/node_modules/sjcl-typescript-definitions',
    'build/node_modules/@types/jquery',
    'build/node_modules/@types/js-cookie'
  ],

  'build/node_modules/testem': [
    install('testem')],
  'build/node_modules/jasmine/bin/jasmine.js': [
    install('jasmine')],
  'build/node_modules/sjcl-typescript-definitions': [
    install('sjcl-typescript-definitions')],
  'build/node_modules/js-cookie': [
    install('js-cookie')],
  'build/node_modules/@types/jquery': [
    install('@types/jquery')],
  'build/node_modules/@types/js-cookie': [
    install('@types/js-cookie')],

  libsync: ['build/node_modules/js-cookie',
    ...['web', 'deploy', AWWW].map(dir =>
      c => `rsync -a lib/*.js lib/bootstrap ${I.join(' ')} ${dir}`)],

  'web/debug.html': ['src/index.haml',
    c => 'mkdir -p web',
    c => `haml --format html5 $< ${c.target}`],
  'deploy/index.html': ['src/index.haml',
    c => 'mkdir -p web',
    c => `haml --format html5 $< ${c.target}`],
  'android/assets/www/index.html': ['src/index.haml',
    c => `haml --format html5 --style ugly $< ${c.target}`],

  'deploy/combined.js': ['compile',
    c => 'mkdir -p deploy',
    c => `java -jar build/compiler.jar --js web/jquery.haml-1.3.js --js web/sekritweb.js --js_output_file ${c.target}`],

  'android/assets/www/combined.js': ['deploy/combined.js',
    c => `cp $< ${c.target}`]

}
