default: dist
.PHONY: default watch

SRCS = $(wildcard ./src/*.js)

node_modules: package.json
	npm install
	touch $@

dist: node_modules $(SRCS)
	npm run make:dist
	touch $@

watch:
	npm run watch
