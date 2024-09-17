Super Sekrit
============

[![Join the chat at https://gitter.im/supersekrit/Lobby](https://badges.gitter.im/supersekrit/Lobby.svg)](https://gitter.im/supersekrit/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Take back control of your privacy

Control who sees your messages.

Send messages to select friends on social networking sites, knowing no
one else can read them. Don't rely on the site's privacy settings.

This code is deployed at <http://www.supersekrit.com>

Or you can host it yourself as described below.


Prerequisites
-------------

    sudo apt-get install ruby-haml ruby-dev
    npm install -g typescript

Also, install Java from <https://java.com/download>


Running Locally
---------------


    make watch


In another terminal

    (cd web; python -m SimpleHTTPServer)

View locally at <http://localhost:8000/debug.html>

To build and view the documention pages do

    (cd doc; make server)

and view at <http://localhost:4444>

Deploying To S3
---------------

    make s3

Eventually (after HTTP caching has timed out), the fact that the new
version is deployed can be verified by looking at
<http://www.supersekrit.com/HISTORY.txt>

To deploy the documentation:

    (cd doc; make deploy)

Deploy to Firebase Hosting
--------------------------

One time only::

    npm install -g firebase-tools
    firebase login
    firebase init


Each time:

    make firebase

License
-------

The Super Sekrit code is distributed under the Eclipse Public License
either version 1.0 or (at your option) any later version.
