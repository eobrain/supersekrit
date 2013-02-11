# Glan

Glan (Irish for "clean", pronounced /_glawn_/) is an extremely simple
way to build a very fast, secure web site.

Use it when you don't need the advanced features of a CMS such as
Drupal or Wordpress.

## Features

* Extremely fast
* Totally secure against hacking
* Fully static, so can be served out of cheap cloud storage from
  Amazon or S3 (and optionally served through a CDN for worldwide speed)
* Markdown page authoring, so no HTML knowledge required
* Structured hierarchically
* Styled with Twitter Bootstrap
* Open source, so customizable and free forever (See LICENSE.md)



## Authoring

To modify an existing Glan web site. you will need to make changes as follows

1. Edit the file [web/site/config.json](web/site/config.json) to set the
title of the web site and other properties.
2. Replace the image [web/site/logo.png](web/site/logo.png) with your logo
3. Edit the file [web/site/footer.txt](web/site/footer.txt) to set the
text that goes on the bottom of each page.
4. Edit the file [web/site/structure.json](web/site/structure.json) to
specify all the pages in your web site and how they are arranged
hierarchically.
5. For every entry in the `structure.json` add a `.txt` file in
Markdown format in
[web/site/pages/](web/site/pages/).  For example
[web/site/pages/home.txt](web/site/pages/home.txt) is the home page. 
6. Specify rotating images in [web/site/rotimg/](web/site/rotimg/)


## Setup and Administration

The following instructions assume you are using a Linux machine, and
will mosly be valid also on a Mac.  If you have a Windows machine, you
will probably want to install Cygwin to get a Unix-like command line.

Download or fork from <https://github.com/eobrain/glan> 

[More instructions coming soon ...]

### Deploying to Amazon S3

Prerequisites

* A Unix-like command line shell, such as on Linux, Mac, or Cygwin
* `make`, which is likely already installed on your Unix-like system
* `s3cmd` for command-line copying to S3.
* `python` for running a local test Web server
* `coffeescript` for generating JavaScript


On Ubuntu and similar Linux systems you can install necessary
dependencies by doing

    sudo apt-get install s3cmd
        

Step-by step:

1. Create an Amazon AWS account if you don't already have one
2. In your browser go to the AWS console and go to the S3 area.
3. Create a bucket called, for example `www.mydomain.com`, and choose
a region, for example `us-west-1`
4. In the Properties, enable Static Website Hosting and set the Index
Document to `index.html`
5. Open the `Makefile` file in a text editor and modify the following
at the top of the file:
    1. set the `BUCKET` variable to your S3 bucket name
    2. set the `REGION` variable to the region of your bucket 
6. Open a command-line shell and `cd` to your Glan directory
7. If this is the first time using `s3cmd` with your AWS account in
the current Glan installation, do

        make config
        
    and enter in your Amazon S3 access key and secret key.  You can
    probably accept all the other defaults if you are deploying what
    will become a public website, except choose "n" to save the
    configuration to the local file `s3.config`.  (Be careful to
    secure this file because whoever has this file can overwrite your
    website.)
8. Copy your dite to the bucket with

        make deploy

9. In your browser view the URL printed out by the previous command,
and verify that you can see your site
10. Now you have three choices:
    1. Use the above Amazon domain for your web site
    2. Use DNS to setup a CNAME entry pointing from a domain of your
    own to the S3 domain.  This must match the bucket name, so for
    example if your bucket is `www.mydomain.com` you must add a CNAME
    entry for `www` to your `mydomain.com` domain, pointing to
    `s3-_region_.amazonaws.com`
    3. Set up a download Cloudfront distribution whose origin is the
    above S3 bucket, with a CNAME of a subdomain whose DNS you
    control, and with a default root object of `index.html`.  Then
    configure your DNS CNAME to point to the created distribution domain.

## Viewing your Site on a Development Machine

To view your blog on your decelopment machine type

    make server
    
This will start an HTTP server serving up your browser at
<http://localhost:4444>
