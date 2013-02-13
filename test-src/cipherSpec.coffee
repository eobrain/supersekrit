describe 'Cipher', ->
  it 'decryption should equal original plaintext', ->
    cipher = new Cipher 'foo', 'bar', the password'
    sekrit = cipher.encrypt 'hello world'
    expect(cipher.decrypt sekrit).toBe 'hello world'
