// Copyright (c) 2014-2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html
//
// Contributors:
// Eamonn O'Brien-Strain e@obrain.com - initial author

/* global describe, it, expect, $ */

const supersekrit = window.supersekrit

describe('Cipher', () =>
  it('decryption should equal original plaintext', () => {
    const cipher = supersekrit.newCipher('foo', 'bar', 'the password')
    const sekrit = cipher.encrypt('hello world')
    expect(cipher.decrypt(sekrit)).toBe('hello world')
  })
)

describe('msg-out area', () =>
  it('can have text put in it', () => {
    $('#msg-out-test').empty()
    $('body').haml([['#msg-out-test']])
    $('body').haml([['.well#foo']])
    $('#foo').text('Some Text')
    expect($('#foo').text()).toBe('Some Text')
    $('#msg-out-test').empty()
  })
)

const pollUntil = (condition, done) => {
  const loop = () => {
    if (condition()) {
      done()
    } else {
      setTimeout(loop, 10)
    }
  }
  loop()
}

describe('haveCirkle', () => {
  it('works 1', (done) => {
    $('#haveCirkle').empty()
    $('body').haml([['#haveCirkle', ['%textarea#msg-in'], ['#sekrit-out'], ['%textarea#sekrit-in'], ['#msg-out']]])
    supersekrit.haveCirkle($('#haveCirkle'), 'Ox9C3BlO72c3AhEuiJxkKeA,vJ88s4FMIkg,uPGZLGKnBCiU05TO-MLL-cBsQw0VD9HT')
    expect($('#sekrit-out').text()).toBe('')
    expect($('#msg-out').text()).toBe('')
    $('#msg-in').text('this is the message')
    $('#msg-in').keyup()
    pollUntil(() => $('#sekrit-out').text().length >= 46, done)
  })
  it('works 2', (done) => {
    const sekritString = $('#sekrit-out').text()
    $('#sekrit-in').text(sekritString)
    $('#sekrit-in').trigger('paste')
    pollUntil(() => $('#msg-out').text().length > 0, done)
  })
  it('works 3', () =>
    expect($('#msg-out').text()).toBe('this is the message')
  )
})
