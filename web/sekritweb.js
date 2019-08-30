// Copyright (c) 2014-2019 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html
//
// Contributors:
// Eamonn O'Brien-Strain e@obrain.com - initial author

/* global alert, sjcl, $ */

(() => {
  const CIRKLE_PREFIX = 'supersekrit'

  const newCipher = (prefix, suffix, password) => {
    const sekritPatt = new RegExp(`${prefix}([A-Za-z0-9_,-]{46,})${suffix}`)

    const toWebsafe = (s) => prefix + s.replace(/\+/g, '-').replace(/\//g, '_') + suffix

    const fromWebsafe = (s) => {
      const sekS = sekritPatt.exec(s)
      if (sekS === null) {
        throw new Error(
          `Cannot decrypt: expect something of the form "${prefix}"..."${suffix}"`)
      }
      return sekS[1].replace(/-/g, '+').replace(/_/g, '/')
    }

    const sekrit2crypt = (s) => {
      const [iv, salt, ct] = fromWebsafe(s).split(',')
      assert(() => iv.length === 22)
      assert(() => salt.length === 11)
      assert(() => ct.length >= 11)
      return `{iv:"${iv}",salt:"${salt}",ct:"${ct}"}`
    }

    const crypt2sekrit = (c) =>
      toWebsafe(c
        .replace(/^{iv:"/, '')
        .replace(/",salt:"/, ',')
        .replace(/",ct:"/, ',')
        .replace(/"}$/, ''))

    return {
      encrypt: (plaintext) =>
        crypt2sekrit(sjcl.encrypt(password, plaintext)),

      decrypt: (ciphertext) => {
        require(() => ciphertext)
        require(() => ciphertext.length >= 46)
        return sjcl.decrypt(password, sekrit2crypt(ciphertext))
      }
    }
  }

  let assert, require
  if (window.location.href.slice(0, 5) === 'file:') {
    console.log('Test Environment. Assertions enabled')
    assert = (predicate) => {
      if (!predicate()) {
        throw new Error(`Assertion failed. ${predicate}`)
      }
    }
    require = (predicate) => {
      if (!predicate()) {
        throw new Error(`Precondition failed. ${predicate}`)
      }
    }
  } else {
    assert = predicate => {}
    require = predicate => {}
  }

  const cirkleCipher = newCipher('O', '', 'supersekrit')

  $(() => {
    $(window).on('hashchange', main)
    main()
    $('#create').click(() => {
      try {
        const friendly = $('#friendly').val().trim() || '(anonymous)'
        window.location.hash = '#' + createCirkle(friendly)
      } catch (e) {
        alert(e)
      }
    })
    const $textarea = $('textarea[readonly]')
    $textarea.mouseenter(() => $textarea.select())
  })

  // function main(): void {
  const main = () => {
    const $content = $('#content')
    const cirkleString = fromHash()
    if (!cirkleString || cirkleString.length === 0) {
      dontHaveCirkle($content)
    } else {
      haveCirkle($content, cirkleString)
    }
  }

  const dontHaveCirkle = ($content) => {
    $('#no-circkle').slideDown()
    $('#bad-circkle').slideUp()
    $('#have-circkle').slideUp()
  }

  const haveCirkle = ($content, cirkleString) => {
    $('.cirkle-name').text(cirkleString)
    let prefix, friendly
    try {
      [prefix, friendly] = (cirkleCipher.decrypt(cirkleString)).split('|')
    } catch (e) {
      prefix = e
      friendly = 'ERROR decrypting'
    }
    $('#no-circkle').slideUp()
    if (prefix !== CIRKLE_PREFIX) {
      $('#bad-circkle').slideDown()
      $('#have-circkle').slideUp()
    }
    $('title').text('Sekrit Cirkle: ' + friendly)
    $('.friendly-name').text(friendly)
    $('#cirkle-link').val(
      'Go to this web page to receive messages from the Sekrit Cirkle: ' +
          friendly + '\n' + window.location.href)
    $('#bad-circkle').slideUp()
    $('#have-circkle').slideDown()
    const cirkle = newCipher('Shh:', '!', cirkleString)
    const $msgIn = $('#msg-in')
    $msgIn.keyup(() =>
      afterTick(() => {
        $('#sekrit-out').text(cirkle.encrypt($msgIn.val().trim()))
        $('#secret-out-wrapper').slideDown()
      })
    )
    const $sekritIn = $('#sekrit-in')
    $sekritIn.on('paste', () => {
      afterTick(() => {
        const sekrit = $sekritIn.val().trim()
        try {
          $('#msg-out').text(cirkle.decrypt(sekrit))
          $('#msg-out-wrapper').slideDown()
        } catch (e) {
          // TODO(eob) fix this hack
          if (e.message !== 'ccm: tag doesn\'t match') {
            alert(e)
          }
        }
      })
    })
  }

  const fromHash = () => window.location.hash.substring(1)
  const createCirkle = (friendly) => cirkleCipher.encrypt(`${CIRKLE_PREFIX}|${friendly}`)
  const afterTick = (func) => setTimeout(func, 0)

  window.supersekrit = {
    newCipher,
    haveCirkle
  }
})()
