
all: chrome/content_script.js web/sekritweb.js libsync

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



