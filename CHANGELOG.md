node-pubcontrol CHANGE LOG
=========================

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
