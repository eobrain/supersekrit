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

  #get string following hash
  fromHash = () ->
     window.location.hash.substring 1

  #Container for all the articles (only one showing at a time)
  $content  = $ '#content'

  #Cointainer for the nav sections for each article (only one showing at a time)
  $children = $ '#children'

  $nav      = $ ".nav"
  #$footer   = $ 'footer'

  #Default to caching AJAX fetched (may override in site/config.json when authoring pages)
  ajaxCache = true




  ############################################################
  # BEGIN singleton that handles page navigation
  currentPage = new ( ->

    #--------------------------------------
    # BEGIN private fields

    currentPageId = fromHash()

    # END private fields
    #--------------------------------------
    # BEGIN private functions

    undisplay = ->
      $('.page-'+currentPageId).slideUp 'fast', ->
        $(@).removeClass 'current'
      $('#menu-'+currentPageId).slideUp 'fast', ->
        $(@).removeClass 'active'

    #fixFooter = ->
    #  console.log $(window).height()
    #  console.log $(document).height()
    #  if $(window).height() < $(document).height()
    #    $footer.addClass 'at-bottom'
    #  else
    #    $footer.removeClass 'at-bottom'

    display = ->
      $('.page-'+currentPageId).slideDown 'fast', ->
        $(@).addClass 'current'
      $('#menu-'+currentPageId).slideDown 'fast', ->
        $(@).addClass 'active'
      #window.setTimeout fixFooter, 1

    # Display the given page
    changePageTo = (newPageId) ->
      undisplay()
      currentPageId = newPageId
      display()

    # END private functions
    #--------------------------------------
    # BEGIN public functions

    @displayIf = (pageId) ->
      if pageId == currentPageId
        display()

    # END public functions
    #--------------------------------------
    # BEGIN constructor


    # go to home if no hash
    if !currentPageId
      window.location.hash = '#home'
      currentPageId = fromHash()


    $(window).on 'hashchange', ->
      changePageTo window.location.hash.substring 1

    # END constructor
    #--------------------------------------

    null
  )
  # END singleton
  ############################################################



  loadMarkDown = (url, $element, pageId) ->
    $.ajax
      url:     url
      cache:   ajaxCache
      success: (md) ->
        $element.append markdown.toHTML md
        if pageId
          title = $(".page-#{ pageId } h1").text()
          if title
            $('.title-'+pageId).text title
      error: (jqXHR, textStatus, errorThrown) ->
        if jqXHR.status == 404
          alert """
Web site is misconfigured:
  There is an entry for \"#{ pageId }\" in structure.json
  but there is no file \"#{ url }\"
"""


  link = (pageId) ->
    "<a class='title-#{ pageId }' href='##{ pageId }'>#{ pageId }</a>"

  fetchPage = (pageId, children) ->
    $content.append "<article class='page-#{pageId}'></article>"
    $page = $ '.page-'+pageId
    loadMarkDown "site/pages/#{ pageId }.txt", $page, pageId
    if pageId != 'home' && _.size(children) > 0
      lis = _.map children, (grandChildren, childId) ->
        "<li>#{ link childId }</li>"
      cat = _.reduce  lis, ((list,item) -> list+item),  ''
      $children.append "<nav class='well page-#{pageId}'><ul>"+cat+'</ul></nav>'


  # Recursive funtion to walk down the structure.json tree
  walkStructure = (pageId, children) ->
    fetchPage pageId, children
    currentPage.displayIf pageId
    _.each children, (grandChildren, childId) ->
      walkStructure childId, grandChildren

  setupTopNav = (home) ->
    _.each home, (grandChildren, childId) ->
        ($nav.append "<li>#{ link childId }</li>").click () ->
          $('.title-'+childId).addClass 'active'


  $.getJSON 'site/config.json', (config) ->
    $('head title').text config.title
    $('#logo').attr 'src', config.logo
    ajaxCache = config.ajaxCache

  $.getJSON 'site/structure.json', (structure) ->
    setupTopNav structure
    walkStructure 'home', structure

  loadMarkDown 'site/footer.txt', $ '#footer'
  loadMarkDown 'README.md',       $ '.page-GLAN'
