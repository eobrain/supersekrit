###
# This file is part of the Glan system http://glawn.org
#
# Copyright (c) 2012,2013 Eamonn O'Brien-Strain All rights
# reserved. This program and the accompanying materials are made
# available under the terms of the Eclipse Public License v1.0 which
# accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
#
# Contributors:
#    Eamonn O'Brien-Strain  e@obrain.com - initial author
###


BUCKET=doc.supersekrit.com
REGION=us-west-1

server: 
	: serving from http://localhost:4444
	cd web; python -m SimpleHTTPServer 4444

config:
	:
	: Go key Access Key ID and Secret Access Key go to
	:    https://portal.aws.amazon.com/gp/aws/securityCredentials
	:
	s3cmd --config=s3.config --configure

deploy: compile
	s3cmd --config=s3.config '--add-header=Cache-Control:public, max-age=3600' --acl-public --exclude=\*~ sync web/ s3://$(BUCKET)
	: view website at http://s3-$(REGION).amazonaws.com/$(BUCKET)/index.html

web/site/rotimg/images.json: web/site/rotimg/*.jpg
	echo "[" > $@
	for jpg in web/site/rotimg/*.jpg; do echo " \"`basename $$jpg`\"," >> $@; done
	echo 'null]' >> $@

dependencies:
	sudo apt-get install s3cmd python


