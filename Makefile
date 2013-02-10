BUCKET=www.supersekrit.com
REGION=us-west-1


compile: web/sekritweb.js libsync

deploy: compile
	git log > web/HISTORY.txt
	s3cmd --config=s3.config '--add-header=Cache-Control:public max-age=60' --acl-public --exclude=\*~ sync web/ s3://$(BUCKET)
	: view website at http://s3-$(REGION).amazonaws.com/$(BUCKET)/index.htm

#chrome/content_script.js: src/content_script.coffee
#	coffee $@ --compile src/content_script.coffee

web/sekritweb.js: src/sekritweb.coffee
	coffee         --output web --compile src/sekritweb.coffee 

watch:
	coffee --watch --output web --compile src/sekritweb.coffee

test-watch: libsync node_modules/testem
	mkdir -p test
	coffee --watch --bare --output test --compile src/sekritweb.coffee test-src/*.coffee &
	cd test; ../node_modules/.bin/testem -g

node_modules/testem:
	npm install testem

libsync: 
	rsync -av lib/*.js lib/bootstrap chrome
	rsync -av lib/*.js lib/bootstrap web
	rsync -av lib/*.js lib/bootstrap test

clean:
	for dir in web chrome test; do rm -r $$dir/*.js $$dir/bootstrap; done

config:
	:
	: Go key Access Key ID and Secret Access Key go to
	:    https://portal.aws.amazon.com/gp/aws/securityCredentials
	:
	s3cmd --config=s3.config --configure


