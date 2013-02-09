describe 'msg-out area', ->

  it 'can have tesxt put in it', ->
    $('msg-out-test').empty()
    $('body').haml [['.well#msg-out']]
    $('#msg-out').text 'Some Text'
    expect( $('#msg-out').text() ).toBe 'Some Text'
