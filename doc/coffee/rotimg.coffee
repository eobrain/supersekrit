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

$ ->
  parity = 0
  $imgs = [ $('#rotimg-odd'), $('#rotimg-even') ]
  imgdir = $imgs[parity].attr 'data-imgdir'
  $.getJSON imgdir+'/images.json', (images) ->
    if images[images.length-1] == null
      images.pop()
    n = images.length
    i = 0
    showImg = ->
      $imgs[parity].fadeOut 'slow'
      parity = 1-parity
      $imgs[parity].attr 'src', "#{ imgdir }/#{ images[i] }"
      $imgs[parity].fadeIn 'slow'
      i = (i+1) % n
    showImg()
    $(window).on 'hashchange', showImg
