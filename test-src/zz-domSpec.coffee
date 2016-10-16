# Copyright (c) 2014 Eamonn O'Brien-Strain All rights reserved. This
# program and the accompanying materials are made available under the
# terms of the Eclipse Public License v1.0 which accompanies this
# distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
#
# Contributors:
# Eamonn O'Brien-Strain e@obrain.com - initial author

describe 'msg-out area', ->

  it 'can have text put in it', ->
    $('#msg-out-test').empty()
    $('body').haml [['#msg-out-test']]
    $('body').haml [['.well#foo']]
    $('#foo').text 'Some Text'
    expect( $('#foo').text() ).toBe 'Some Text'
    $('#msg-out-test').empty()

describe 'haveCirkle', ->

  it 'works', ->

    runs ->
      $('#haveCirkle').empty()
      $('body').haml [
        ['#haveCirkle'
          ['%textarea#msg-in']
          ['#sekrit-out']
          ['%textarea#sekrit-in']
          ['#msg-out'] ]]

      haveCirkle $('#haveCirkle'),
                 'Ox9C3BlO72c3AhEuiJxkKeA,vJ88s4FMIkg,uPGZLGKnBCiU05TO-MLL-cBsQw0VD9HT'
      expect( $('#sekrit-out').text() ).toBe ''
      expect( $('#msg-out').text() ).toBe ''
      $('#msg-in').text 'this is the message'
      $('#msg-in').keyup()

    waitsFor ->
      $('#sekrit-out').text().length >= 46

    runs ->
      sekritString = $('#sekrit-out').text()
      $('#sekrit-in').text sekritString
      $('#sekrit-in').trigger 'paste'

    waitsFor ->
      $('#msg-out').text().length > 0

    runs ->
      expect( $('#msg-out').text() ).toBe 'this is the message'
