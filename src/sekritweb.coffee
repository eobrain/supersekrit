window.docrypt = () ->
  $("#crypttext").text sjcl.encrypt(
    $("#password").text,
    $("#plaintext").text
  )

