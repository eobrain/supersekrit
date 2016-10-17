# Copyright (c) 2014 Eamonn O'Brien-Strain All rights reserved. This
# program and the accompanying materials are made available under the
# terms of the Eclipse Public License v1.0 which accompanies this
# distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
#
# Contributors:
# Eamonn O'Brien-Strain e@obrain.com - initial author

BUCKET=www.supersekrit.com
REGION=us-west-1

AWWW=android/assets/www

build:         deploy/index.html  deploy/index.css deploy/combined.js

build-android: $(AWWW)/index.html $(AWWW)/index.css $(AWWW)/combined.js # $(AWWW)/js/index.js 

android/bin/SuperSekrit-debug.apk: build-android
	cd android; ant debug

installed-on-emulator: android/bin/SuperSekrit-debug.apk
	adb uninstall com.supersekrit
	adb install $<

emulator:
	emulator -wipe-data -scale 0.6667 -avd SII

debug: web/debug.html web/index.css compile

compile: web/sekritweb.js libsync

watch: web/debug.html web/index.css libsync
	coffee --watch --output web --compile src/sekritweb.coffee

tdd: libsync build/node_modules/testem
	coffee --bare --output test --compile src/sekritweb.coffee test-src/*.coffee
	cd test; ../build/node_modules/.bin/testem -g
test-watch: libsync build/node_modules/testem
	coffee --watch --bare --output test --compile src/sekritweb.coffee test-src/*.coffee

clean:
	#for dir in chrome; do rm -rf $$dir/*.js $$dir/bootstrap $$dir/*.png $$dir/*.jpg; done
	rm -rf deploy build/node_modules web test

s3: cms build
	git log > deploy/HISTORY.txt
	s3cmd --config=s3.config '--add-header=Cache-Control:public, max-age=3600' --acl-public --exclude=\*~ sync deploy/ s3://$(BUCKET)
	: view website at http://s3-$(REGION).amazonaws.com/$(BUCKET)

#############################################################################

cms: doc/s3.config
	cd doc; $(MAKE) deploy

s3.config:
	:
	: Go key Access Key ID and Secret Access Key go to
	:    https://portal.aws.amazon.com/gp/aws/securityCredentials
	:
	s3cmd --config=$@ --configure

doc/s3.config: s3.config
	cp s3.config $@

web/index.css:   src/index.css
	rsync -a $< $@
deploy/index.css:  src/index.css
	rsync -a $< $@
$(AWWW)/index.css: src/index.css
	rsync -a $< $@


#chrome/content_script.js: src/content_script.coffee
#	coffee $@ --compile src/content_script.coffee

web/sekritweb.js: src/sekritweb.coffee
	coffee --output `dirname $@` --compile $<
#$(AWWW)/js/index.js: src/android/index.coffee
#	coffee --output `dirname $@` --compile $<

build/node_modules/testem:
	cd build; npm install testem

I=\
 img/talk_shows_on_mute_by_katie_tegtmeyer-whitened.jpg\
 img/talk_shows_on_mute_by_katie_tegtmeyer-icon-32x32.png\
 img/talk_shows_on_mute_by_katie_tegtmeyer-icon-60x32.jpg

libsync: 
#	rsync -a lib/*.js lib/bootstrap chrome
	rsync -a lib/*.js lib/bootstrap $I web
	rsync -a lib/*.js lib/bootstrap    test
	rsync -a lib/*.js lib/bootstrap $I deploy
	rsync -a lib/*.js lib/bootstrap $I $(AWWW)



web/debug.html: src/index.haml
	mkdir -p web
	haml --format html5 $< $@
deploy/index.html: src/index.haml
	mkdir -p deploy
	haml --format html5 --style ugly $< $@
$(AWWW)/index.html: src/index.haml
	haml --format html5 --style ugly $< $@

deploy/combined.js: compile
	mkdir -p deploy
	java -jar build/compiler.jar --js web/jquery.haml-1.3.js --js web/sekritweb.js --js_output_file $@

$(AWWW)/combined.js: deploy/combined.js
	cp $< $@




