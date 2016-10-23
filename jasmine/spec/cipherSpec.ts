// Copyright (c) 2014 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html
//
// Contributors:
// Eamonn O'Brien-Strain e@obrain.com - initial author

/// <reference path="../../lib/jasmine.d.ts" />
/// <reference path="../../src/sekritweb.ts" />


describe('Cipher', () => {
  it('decryption should equal original plaintext', () => {
    const cipher = new supersekrit.Cipher('foo', 'bar', 'the password');
    const sekrit = cipher.encrypt('hello world');
    expect(cipher.decrypt(sekrit)).toBe('hello world');
  });
});
