/// <reference path="../build/node_modules/sjcl-typescript-definitions/sjcl/sjcl.d.ts" />
/// <reference path="../build/node_modules/@types/jquery/index.d.ts" />


(() => {
  const CIRKLE_PREFIX = 'supersekrit';

  const Cipher = ((prefix, suffix, password) => {
    var crypt2sekrit, fromWebsafe, sekrit2crypt, toWebsafe;
    const SEKRIT_PATT = new RegExp(prefix + "([A-Za-z0-9_,-]{46,})" + suffix);
    toWebsafe = (s) => {
      s = s.replace(/\+/g, '-').replace(/\//g, '_');
      return "" + prefix + s + suffix;
    };
    fromWebsafe = (s) => {
      const sekS = SEKRIT_PATT.exec(s);
      if (sekS === null) {
        throw "Cannot decrypt: expect something of the form \"" + prefix + "..." + suffix + "\"";
      }
      return sekS[1].replace(/\-/g, '+').replace(/_/g, '/');
    };
    sekrit2crypt = (s) => {
      const ref = fromWebsafe(s).split(',');
      const iv = ref[0];
      const salt = ref[1];
      const ct = ref[2];
      assert(() => iv.length === 22);
      assert(() => salt.length === 11);
      assert(() => ct.length >= 11);
      return "{iv:\"" + iv + "\",salt:\"" + salt + "\",ct:\"" + ct + "\"}";
    };
    crypt2sekrit = (c) => {
      const commaSeparated = c.replace(/^{iv:\"/, '').replace(/",salt:"/, ',').replace(/",ct:"/, ',').replace(/\"}$/, '');
      return toWebsafe(commaSeparated);
    };
    this.encrypt = (plaintext) => crypt2sekrit(sjcl.encrypt(password, plaintext));
    this.decrypt = (ciphertext) => {
      require(() => ciphertext);
      require(() => ciphertext.length >= 46);
      return sjcl.decrypt(password, sekrit2crypt(ciphertext));
    };
  });

  let assert, require;
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

  const CIRKLE_CIPHER = new Cipher('O', '', 'supersekrit');

  $(() => {
    $(window).on('hashchange', main);
    main();
    $('#create').click(() => {
      try {
        const friendly = $('#friendly').val().trim() || '(anonymous)';
        const cirkleString = createCirkle(friendly);
        return window.location.hash = '#' + cirkleString;
      } catch (e) {
        return alert(e);
      }
    });
    return $('textarea[readonly]').mouseenter(() => $(this).select());
  });

  const main = () => {
    const $content = $('#content');
    const cirkleString = fromHash();
    return (!cirkleString || cirkleString.length === 0)
        ? dontHaveCirkle($content)
        : haveCirkle($content, cirkleString);
  };

  const dontHaveCirkle = ($content) => {
    $('#no-circkle').slideDown();
    $('#bad-circkle').slideUp();
    return $('#have-circkle').slideUp();
  };

  const haveCirkle = ($content, cirkleString) => {
    $('.cirkle-name').text(cirkleString);
    let prefix, friendly;
    try {
      const ref = (CIRKLE_CIPHER.decrypt(cirkleString)).split('|')
      prefix = ref[0]
      friendly = ref[1];
    } catch (e) {
      prefix = e;
      friendly = "ERROR decrypting";
    }
    $('#no-circkle').slideUp();
    if (prefix !== CIRKLE_PREFIX) {
      $('#bad-circkle').slideDown();
      return $('#have-circkle').slideUp();
    }
    $('title').text("Sekrit Cirkle: " + friendly);
    $('.friendly-name').text(friendly);
    $('#cirkle-link').val("Go to this web page to receive messages from the Sekrit Cirkle: " + friendly + "\n" + window.location.href);
    $('#bad-circkle').slideUp();
    $('#have-circkle').slideDown();
    const cirkle = new Cipher('Shh:', '!', cirkleString);
    const $msgIn = $('#msg-in');
    $msgIn.keyup(() => {
      return afterTick(() => {
        $('#sekrit-out').text(cirkle.encrypt($msgIn.val().trim()));
        return $('#secret-out-wrapper').slideDown();
      });
    });
    const $sekritIn = $('#sekrit-in');
    return $sekritIn.on('paste', () => {
      return afterTick(() => {
        const sekrit = $sekritIn.val().trim();
        try {
          $('#msg-out').text(cirkle.decrypt(sekrit));
          $('#msg-out-wrapper').slideDown();
        } catch (e) {
          alert(e);
        }
      });
    });
  };

  const fromHash = () => window.location.hash.substring(1);

  const createCirkle = (friendly) => CIRKLE_CIPHER.encrypt(CIRKLE_PREFIX + "|" + friendly);

  const afterTick = (func) => setTimeout(func, 0);

}).call(this);
