# Copyright (c) 2014 Eamonn O'Brien-Strain All rights reserved. This
# program and the accompanying materials are made available under the
# terms of the Eclipse Public License v1.0 which accompanies this
# distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
#
# Contributors:
# Eamonn O'Brien-Strain e@obrain.com - initial author

describe 'Cipher', ->
  it 'decryption should equal original plaintext', ->
    cipher = new Cipher 'foo', 'bar', 'the password'
    sekrit = cipher.encrypt 'hello world'
    expect(cipher.decrypt sekrit).toBe 'hello world'
