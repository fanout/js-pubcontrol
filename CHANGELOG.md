# js-pubcontrol Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [Planned for 2.0.0]
Major update with great improvements in usability, with support for modern
language features such as `class` and `async`/`await`.

### To be Added
- To add samples for ESM, CommonJS, Browser, and use in a Worker.
- To add Typescript annotations for IDE completion and static type checking.

### To be Changed
### To be Removed

## [2.0.0-beta.10] - 2020-01-13
### Added
- Added ESM build. Uses Rollup (https://rollupjs.org/) to build bundles for consumption as CommonJS, ESM,
  and the Browser.
- Added new simple NodeJS based demo that uses pushpin (https://pushpin.org).
- Added `PublishException` class, which will be thrown when a problem occurs during a publish.
- Added a shimmed `Buffer` object to browser build, as it is needed during JWT authorization.
- IDE metadata for IntelliJ IDEA.

### Changed
- Repository now called `js-pubcontrol` to reflect that this is useful in all types of JavaScript,
  including the browser.
- Now distributed as a public scoped package `@fanouio/pubcontrol`.
- Source files and tests rewritten in modern style JavaScript
- Source files moved from `/lib` to `/src`
- Basic data structures now using ES6 classes.
- Start using "changelog" over "change log" since it's the common usage.
- Bump major version to 2 to indicate that this is a modernized new version.
- Improved README by being more straightforward with the basic use case.
- `PubControl.publish` API has been changed, and the callback is now optional.
  If no callback is provided, a Promise is returned instead.

### Removed
- `PubControlClientCallbackHandler` class has been removed. Internally, the library now uses
  `Promise.all` to keep track of calls to multiple publishing clients, making this
  class unnecessary.
- browser demo has been removed and moved to a separate repository.
- Removed `Makefile`. This is superseded by the scripts section of package.json.

## Older entries

v 0.1.0 04-03-2013  - Initial Release. Formats, Items, Publisher, Authentication.
v 0.1.1 04-17-2013  - Better handling of JWT key, see toBuffer() for details.  
v 0.2.0 04-18-2013  - Callback now called with three parameters: status, message, and context.  
v 0.3.0 04-18-2013  - HTTP response codes outside the 200 range are now considered failures.  
v 0.3.1 04-18-2013  - Error messages generated from HTTP response data are now escaped with JSON.stringify().  
v 0.3.2 05-15-2013  - Documentation updates to reflect new company name.  
v 0.3.3, 0.3.4      - Version skipped  
v 0.3.5 04-02-2014  - Fix Content-Length header on POST.  
v 1.0.0 01-20-2015  - Implemented PubControlSet as PubControl and README updates.  
v 1.0.1 01-20-2015  - Updated documentation.  
v 1.0.2 01-20-2015  - Updated documentation.  
v 1.0.3 01-21-2015  - Fixed the pcccbhandler instance issue for callbacks.  
v 1.0.4 01-22-2015  - Fixed a grip / pubcontrol pcccbhandler related issue.  
v 1.0.5 02-02-2015  - Updated dependency versions.  
v 1.0.6 02-02-2015  - Cleaned up repo.  
v 1.0.7 03-23-2015  - Split up code into multiple files and added documentation and tests.  
v 1.1.0 04-22-2015  - Implemented persistent HTTP and HTTPS connections.
