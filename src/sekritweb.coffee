CIRKLE_PREFIX   = 'supersekrit'

#BEGIN Cipher class
Cipher = ( (prefix, suffix, password) ->

  SEKRIT_PATT = new RegExp "#{prefix}([A-Za-z0-9_,-]{46,})#{suffix}"

  toWebsafe = (s) ->
    s = s.replace( /\+/g, '-' )
         .replace( /\//g, '_' )
    "#{prefix}#{s}#{suffix}"

  fromWebsafe = (s) ->
    sekS = SEKRIT_PATT.exec s
    if sekS == null
      throw "Cannot decrypt: expect something of the form \"#{prefix}...#{suffix}\""
    sekS[1].replace( /\-/g, '+' )
           .replace( /_/g , '/' )

  sekrit2crypt = (s) ->
    [iv, salt, ct] = fromWebsafe(s).split ','
    assert ->   iv.length == 22
    assert -> salt.length == 11
    assert ->   ct.length >= 11
    "{iv:\"#{iv}\",salt:\"#{salt}\",ct:\"#{ct}\"}"

  crypt2sekrit = (c) ->
    commaSeparated = c.replace( /^{iv:\"/ , ''  )
                      .replace( /",salt:"/, ',' )
                      .replace( /",ct:"/  , ',' )
                      .replace( /\"}$/    , ''  )
    toWebsafe commaSeparated

  @encrypt = (plaintext) ->
    crypt2sekrit sjcl.encrypt password, plaintext

  @decrypt = (ciphertext) ->
    require -> ciphertext
    require -> ciphertext.length >= 46
    sjcl.decrypt password, sekrit2crypt ciphertext


  null
)
#END Cipher class

if window.location.href.slice(0,5) == 'file:'
  console.log 'Test Environment. Assertions enabled'

  assert = (predicate) ->
    if !predicate()
      throw "Assertion failed. #{predicate}"

  require = (predicate) ->
    if !predicate()
      throw "Precondition failed. #{predicate}"

else
  #Production Environment, Assertions disabled

  assert  = (predicate) ->
  require = (predicate) ->


CIRKLE_CIPHER = new Cipher 'O', '', 'supersekrit'

$ ->
  $(window).on 'hashchange', main
  main()

  $('#create').click ->
    try
      friendly = $('#friendly').val().trim() || '(anonymous)'
      cirkleString = createCirkle friendly
      #$('#topnav').haml [
      #  ['%li', {href: cirkleString}, friendly]
      #]
      window.location.hash = '#' + cirkleString
    catch e
      alert e

  $('textarea[readonly]').mouseenter ->
    $(@).select()
    #$(@)[0].setSelectionRange 0, 9999

main = ->
  $content = $ '#content'

  cirkleString = fromHash()

  if !cirkleString || cirkleString.length==0
    dontHaveCirkle $content
  else
    haveCirkle $content, cirkleString

dontHaveCirkle = ($content) ->
  $('#no-circkle').slideDown()
  $('#bad-circkle').slideUp()
  $('#have-circkle').slideUp()


haveCirkle = ($content, cirkleString) ->

  $('.cirkle-name').text cirkleString
  try
    [prefix,friendly] = (CIRKLE_CIPHER.decrypt cirkleString).split '|'
  catch e
    prefix = e
  $('#no-circkle').slideUp()
  if prefix != CIRKLE_PREFIX
    $('#bad-circkle').slideDown()
    $('#have-circkle').slideUp()
  else
    $('title').text "Sekrit Cirkle: #{friendly}"
    $('.friendly-name').text friendly
    $('#cirkle-link').val """Go to this web page to receive messages from the Sekrit Cirkle: #{friendly}
#{window.location.href}"""
    $('#bad-circkle').slideUp()
    $('#have-circkle').slideDown()
    cirkle = new Cipher 'Shh:', '!', cirkleString
    $msgIn = $ '#msg-in'
    $msgIn.keyup ->
      afterTick ->
        $('#sekrit-out').text cirkle.encrypt $msgIn.val().trim()
        $('#secret-out-wrapper').slideDown()
    $sekritIn = $ '#sekrit-in'
    $sekritIn.on 'paste', ->
      afterTick ->
        sekrit = $sekritIn.val().trim()
        try
          $('#msg-out').text cirkle.decrypt sekrit
          $('#msg-out-wrapper').slideDown()
        catch e
          alert e



#get string following hash
fromHash =  ->
  window.location.hash.substring 1


createCirkle = (friendly) ->
  CIRKLE_CIPHER.encrypt "#{CIRKLE_PREFIX}|#{friendly}"


afterTick = (func) ->  setTimeout func, 0
