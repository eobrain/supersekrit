/// <reference path="../build/node_modules/sjcl-typescript-definitions/sjcl/sjcl.d.ts" />
/// <reference path="../build/node_modules/@types/jquery/index.d.ts" />


(() => {
  var CIRKLE_CIPHER, CIRKLE_PREFIX, Cipher, afterTick, assert, createCirkle, dontHaveCirkle, fromHash, haveCirkle, main, require;

  CIRKLE_PREFIX = 'supersekrit';

  Cipher = ((prefix, suffix, password) => {
    var SEKRIT_PATT, crypt2sekrit, fromWebsafe, sekrit2crypt, toWebsafe;
    SEKRIT_PATT = new RegExp(prefix + "([A-Za-z0-9_,-]{46,})" + suffix);
    toWebsafe = (s) => {
      s = s.replace(/\+/g, '-').replace(/\//g, '_');
      return "" + prefix + s + suffix;
    };
    fromWebsafe = (s) => {
      var sekS;
      sekS = SEKRIT_PATT.exec(s);
      if (sekS === null) {
        throw "Cannot decrypt: expect something of the form \"" + prefix + "..." + suffix + "\"";
      }
      return sekS[1].replace(/\-/g, '+').replace(/_/g, '/');
    };
    sekrit2crypt = (s) => {
      var ct, iv, ref, salt;
      ref = fromWebsafe(s).split(','), iv = ref[0], salt = ref[1], ct = ref[2];
      assert(() => {
        return iv.length === 22;
      });
      assert(() => {
        return salt.length === 11;
      });
      assert(() => {
        return ct.length >= 11;
      });
      return "{iv:\"" + iv + "\",salt:\"" + salt + "\",ct:\"" + ct + "\"}";
    };
    crypt2sekrit = (c) => {
      var commaSeparated;
      commaSeparated = c.replace(/^{iv:\"/, '').replace(/",salt:"/, ',').replace(/",ct:"/, ',').replace(/\"}$/, '');
      return toWebsafe(commaSeparated);
    };
    this.encrypt = (plaintext) => {
      return crypt2sekrit(sjcl.encrypt(password, plaintext));
    };
    this.decrypt = (ciphertext) => {
      require(() => {
        return ciphertext;
      });
      require(() => {
        return ciphertext.length >= 46;
      });
      return sjcl.decrypt(password, sekrit2crypt(ciphertext));
    };
    return null;
  });

  if (window.location.href.slice(0, 5) === 'file:') {
    console.log('Test Environment. Assertions enabled');
    assert = (predicate) => {
      if (!predicate()) {
        throw "Assertion failed. " + predicate;
      }
    };
    require = (predicate) => {
      if (!predicate()) {
        throw "Precondition failed. " + predicate;
      }
    };
  } else {
    assert = (predicate) => {};
    require = (predicate) => {};
  }

  CIRKLE_CIPHER = new Cipher('O', '', 'supersekrit');

  $(() => {
    $(window).on('hashchange', main);
    main();
    $('#create').click(() => {
      var cirkleString, e, friendly;
      try {
        friendly = $('#friendly').val().trim() || '(anonymous)';
        cirkleString = createCirkle(friendly);
        return window.location.hash = '#' + cirkleString;
      } catch (_error) {
        e = _error;
        return alert(e);
      }
    });
    return $('textarea[readonly]').mouseenter(() => {
      return $(this).select();
    });
  });

  main = () => {
    var $content, cirkleString;
    $content = $('#content');
    cirkleString = fromHash();
    if (!cirkleString || cirkleString.length === 0) {
      return dontHaveCirkle($content);
    } else {
      return haveCirkle($content, cirkleString);
    }
  };

  dontHaveCirkle = ($content) => {
    $('#no-circkle').slideDown();
    $('#bad-circkle').slideUp();
    return $('#have-circkle').slideUp();
  };

  haveCirkle = ($content, cirkleString) => {
    var $msgIn, $sekritIn, cirkle, e, friendly, prefix, ref;
    $('.cirkle-name').text(cirkleString);
    try {
      ref = (CIRKLE_CIPHER.decrypt(cirkleString)).split('|'), prefix = ref[0], friendly = ref[1];
    } catch (_error) {
      e = _error;
      prefix = e;
    }
    $('#no-circkle').slideUp();
    if (prefix !== CIRKLE_PREFIX) {
      $('#bad-circkle').slideDown();
      return $('#have-circkle').slideUp();
    } else {
      $('title').text("Sekrit Cirkle: " + friendly);
      $('.friendly-name').text(friendly);
      $('#cirkle-link').val("Go to this web page to receive messages from the Sekrit Cirkle: " + friendly + "\n" + window.location.href);
      $('#bad-circkle').slideUp();
      $('#have-circkle').slideDown();
      cirkle = new Cipher('Shh:', '!', cirkleString);
      $msgIn = $('#msg-in');
      $msgIn.keyup(() => {
        return afterTick(() => {
          $('#sekrit-out').text(cirkle.encrypt($msgIn.val().trim()));
          return $('#secret-out-wrapper').slideDown();
        });
      });
      $sekritIn = $('#sekrit-in');
      return $sekritIn.on('paste', () => {
        return afterTick(() => {
          var sekrit;
          sekrit = $sekritIn.val().trim();
          try {
            $('#msg-out').text(cirkle.decrypt(sekrit));
            $('#msg-out-wrapper').slideDown();
          } catch (_error) {
            e = _error;
            alert(e);
          }
        });
      });
    }
  };

  fromHash = () => {
    return window.location.hash.substring(1);
  };

  createCirkle = (friendly) => {
    return CIRKLE_CIPHER.encrypt(CIRKLE_PREFIX + "|" + friendly);
  };

  afterTick = (func) => {
    return setTimeout(func, 0);
  };

}).call(this);
