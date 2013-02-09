BUCKET=www.supersekrit.com
REGION=us-west-1


compile: chrome/content_script.js web/sekritweb.js libsync

deploy: compile
	git log > web/HISTORY.txt
	s3cmd --config=s3.config '--add-header=Cache-Control:public max-age=60' --acl-public --exclude=\*~ sync web/ s3://$(BUCKET)
	: view website at http://s3-$(REGION).amazonaws.com/$(BUCKET)/index.htm

chrome/content_script.js: src/content_script.coffee
	coffee $@ --compile src/content_script.coffee

web/sekritweb.js: src/sekritweb.coffee
	coffee --compile src/sekritweb.coffee --output web

watch:
	coffee --watch --output web --compile src/sekritweb.coffee

libsync: 
	rsync -av lib/*.js lib/bootstrap chrome
	rsync -av lib/*.js lib/bootstrap web

clean:
	rm web/*.js
	rm chrome/*.js



