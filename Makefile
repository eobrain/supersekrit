
all: chrome/content_script.js web/sekritweb.js libsync

chrome/content_script.js: src/content_script.coffee
	coffee --lint --join $@ --compile src/content_script.coffee

web/sekritweb.js: src/sekritweb.coffee
	coffee --lint --join $@ --compile src/sekritweb.coffee

libsync: 
	rsync lib/*.js chrome
	rsync lib/*.js web

clean:
	rm web/*.js
	rm chrome/*.js



