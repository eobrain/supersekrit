CIRKLE_PREFIX   = 'supersekrit'

#BEGIN Cipher class
Cipher = ( (password) ->

  toWebsafe = (s) ->
    s.replace( /\+/g, '-' )
     .replace( /\//g, '_' )

  fromWebsafe = (s) ->
    s.replace( /\-/g, '+' )
     .replace( /_/g , '/' )

  sekrit2crypt = (s) ->
    [iv, salt, ct] = fromWebsafe(s).split ','
    assert ->   iv.length == 22
    assert -> salt.length == 11
    assert ->   ct.length >= 11
    "{iv:\"#{iv}\",salt:\"#{salt}\",ct:\"#{ct}\"}"

  crypt2sekrit = (c) ->
    toWebsafe c.replace( /^{iv:\"/ , ''  )
               .replace( '",salt:"', ',' )
               .replace( '",ct:"'  , ',' )
               .replace( /\"}$/    , ''  )

  @encrypt = (plaintext) ->
    crypt2sekrit sjcl.encrypt password, plaintext

  @decrypt = (ciphertext) ->
    require -> ciphertext.length >= 46
    sjcl.decrypt password, sekrit2crypt ciphertext

  null
)
#END Cipher class

if window.location.href.slice(0,5) == 'file:'
  console.log 'Test Environment. Assertions enabled'

  assert = (predicate) ->
    if !predicate()
      alert "Assertion failed. #{predicate}"

  require = (predicate) ->
    if !predicate()
      alert "Precondition failed. #{predicate}"

else
  #Production Environment, Assertions disabled

  assert  = (predicate) ->
  require = (predicate) ->


CIRKLE_CIPHER = new Cipher 'supersekrit'

$ ->
  $content = $ '#content'

  dontHaveCirkle = ->
    $content.empty()
    $content.haml [
      ['.row'
        ['.span3.hidden-phone']
        ['%form.span6'
          ['%fieldset'
            ['%legend', 'Create new Cirkle ...']
            ['%input#friendly', {
              type:'text'
              placeholder:'Enter name here (optional) ...'
              }]
            ['%button#create', {type:'submit', class:'btn'}, 'Create']]] ]]

    $('#create').click ->
      try
        friendly = $('#friendly').val() || 'Cirkle'
        window.location.hash = '#' + (createCirkle friendly)
      catch e
        alert e

  haveCirkle = (cirkleString) ->

    [prefix,friendly] = (CIRKLE_CIPHER.decrypt cirkleString).split '|'
    $content.empty()

    $content.haml if prefix != CIRKLE_PREFIX
      [
        ['.row'
          ['%h2.span12', 'Bad Circle']
          ['%p.span12', """
                       Sorry \"#{cirkle}\" is not a valid cirkle.
                               Did you copy it properly?""" ]]]
    else
      cirkle = new Cipher cirkleString
      [
        ['.row'
          ['%h2.span12', "#{friendly} Cirkle"]]
        ['.row'
          ['%form.span6'
            ['%fieldset'
              ['%legend', 'Create a Sekrit']
              ['%textarea#msg-in.span6', {
                placeholder:'Type your message here ...' }]
              ['.well#sekrit-out']]]
          ['%form.span6'
            ['%fieldset'
              ['%legend', 'Read a Sekrit']
              ['%textarea#sekrit-in.span6', {
                placeholder:'Paste a sekrit here ...' }]
              ['.well#msg-out']]]]]
    $('#msg-in').keypress ->
      $('#sekrit-out').text cirkle.encrypt $(@).val()
    $sekritIn = $('#sekrit-in')
    #$sekritIn.keypress ->
    $sekritIn.on 'paste', ->
      afterTick ->
        $('#msg-out').text cirkle.decrypt $sekritIn.val()


  cirkleString = fromHash()

  if !cirkleString
    dontHaveCirkle()
  else
    haveCirkle cirkleString

  $(window).on 'hashchange', ->
    haveCirkle fromHash()





#get string following hash
fromHash =  ->
  window.location.hash.substring 1


createCirkle = (friendly) ->
  CIRKLE_CIPHER.encrypt "#{CIRKLE_PREFIX}|#{friendly}"


afterTick = (func) ->  setTimeout func, 10



window.docrypt = () ->
  cirkle = $("#cirkle").val()
  plaintext = $("#plaintext").val()
  sekrit = crypt2sekrit sjcl.encrypt cirkle, plaintext
  console.log "#{plaintext.length} -> #{sekrit.length} chars"
  $("#crypttext").val sekrit
  crypt = sekrit2crypt sekrit
  console.log crypt
  console.log "d(e(m))=#{ sjcl.decrypt cirkle, crypt }"
