describe 'Cipher', ->
  it 'decryption should equal original plaintext', ->
    cipher = new Cipher 'the password'
    sekrit = cipher.encrypt 'hello world'
    expect(cipher.decrypt sekrit).toBe 'hello world'
