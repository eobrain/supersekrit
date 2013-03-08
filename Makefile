BUCKET=www.supersekrit.com
REGION=us-west-1

build: deploy/index.html deploy/index.css deploy/combined.js

debug: web/debug.html web/index.css compile

compile: web/sekritweb.js libsync

watch: web/debug.html web/index.css libsync
	coffee --watch --output web --compile src/sekritweb.coffee

tdd: libsync build/node_modules/testem
	coffee --bare --output test --compile src/sekritweb.coffee test-src/*.coffee
	cd test; ../build/node_modules/.bin/testem -g
test-watch: libsync build/node_modules/testem
	coffee --watch --bare --output test --compile src/sekritweb.coffee test-src/*.coffee

config:
	:
	: Go key Access Key ID and Secret Access Key go to
	:    https://portal.aws.amazon.com/gp/aws/securityCredentials
	:
	s3cmd --config=s3.config --configure

clean:
	for dir in web chrome test; do rm -rf $$dir/*.js $$dir/bootstrap; done
	rm -rf deploy build/node_modules web/debug.html

s3: cms build
	git log > deploy/HISTORY.txt
	s3cmd --config=s3.config '--add-header=Cache-Control:public, max-age=3600' --acl-public --exclude=\*~ sync deploy/ s3://$(BUCKET)
	: view website at http://s3-$(REGION).amazonaws.com/$(BUCKET)/index.htm

#############################################################################

cms:
	cd doc; $(MAKE) deploy

web/index.css:   src/index.css
	rsync -a $< $@
deploy/index.css: src/index.css
	rsync -a $< $@


#chrome/content_script.js: src/content_script.coffee
#	coffee $@ --compile src/content_script.coffee

web/sekritweb.js: src/sekritweb.coffee
	coffee         --output web --compile src/sekritweb.coffee 

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



web/debug.html: src/index.haml
	haml --format html5 $< $@
deploy/index.html: src/index.haml
	mkdir -p deploy
	haml --format html5 --style ugly $< $@

deploy/combined.js: compile
	mkdir -p deploy
	java -jar build/compiler.jar --js web/jquery.haml-1.3.js --js web/sekritweb.js --js_output_file $@




