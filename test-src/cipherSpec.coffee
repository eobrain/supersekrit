describe 'Cipher', ->
  it 'decryption should equal original plaintext', ->
    cipher = new Cipher 'the password'
    sekrit = cipher.encrypt 'hello world'
    expect(cipher.decrypt sekrit).toBe 'hello world'

describe 'msg-out area', ->
  it 'has all decrypted text', ->
    waitsFor ->
      try
        $
        true
      catch e
        false
    runs ->
      cipher = new Cipher 'the password'
      sekrit = cipher.encrypt 'hello world'
      $('msg-out-test').empty()
      $('body').haml [['.well#msg-out']]
      $('#msg-out').text cipher.decrypt sekrit
