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
                 'x9C3BlO72c3AhEuiJxkKeA,vJ88s4FMIkg,uPGZLGKnBCiU05TO-MLL-cBsQw0VD9HT'
      expect( $('#sekrit-out').text() ).toBe ''
      expect( $('#msg-out').text() ).toBe ''
      $('#msg-in').text 'this is the message'
      $('#msg-in').keypress()

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
