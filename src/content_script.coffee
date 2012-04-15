
$('textarea').each (index) ->
    buttonId = "supersekrit" + index
    textarea = $ this
    $(this).after "<button id='#{buttonId}'>SHHH!</button>"
    $("#" + buttonId).click (e) -> textarea.val "supersekrit for friend: " + textarea.val()
