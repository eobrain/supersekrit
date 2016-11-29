// Copyright (c) 2014 Eamonn O'Brien-Strain All rights reserved. This
// program and the accompanying materials are made available under the
// terms of the Eclipse Public License v1.0 which accompanies this
// distribution, and is available at
// http://www.eclipse.org/legal/epl-v10.html
//
// Contributors:
// Eamonn O'Brien-Strain e@obrain.com - initial author


/// <reference path="../node_modules/sjcl-typescript-definitions/sjcl/sjcl.d.ts" />
/// <reference path="../node_modules/@types/jquery/index.d.ts" />

namespace supersekrit {
  const CIRKLE_PREFIX = 'supersekrit';

  export class Cipher {
    private readonly sekritPatt;

    constructor (
      private readonly prefix: string,
      private readonly suffix: string,
      private readonly password: string) {
      this.sekritPatt = new RegExp(this.prefix + '([A-Za-z0-9_,-]{46,})' + this.suffix);
    }

    private toWebsafe(s: string): string {
      return this.prefix + s.replace(/\+/g, '-').replace(/\//g, '_') + this.suffix;
    }

    private fromWebsafe(s: string): string {
      const sekS = this.sekritPatt.exec(s);
      if (sekS === null) {
        throw 'Cannot decrypt: expect something of the form "' + this.prefix + '"..."' + this.suffix + '"';
      }
      return sekS[1].replace(/\-/g, '+').replace(/_/g, '/');
    }

    private sekrit2crypt(s: string): sjcl.SjclCipherEncrypted {
      const ref = this.fromWebsafe(s).split(',');
      const iv = ref[0];
      const salt = ref[1];
      const ct = ref[2];
      assert(() => iv.length === 22);
      assert(() => salt.length === 11);
      assert(() => ct.length >= 11);
      const result = '{iv:"' + iv + '",salt:"' + salt + '",ct:"' + ct + '"}';
      return result as any as sjcl.SjclCipherEncrypted;
    }

    private crypt2sekrit(c: sjcl.SjclCipherEncrypted): string {
      const commaSeparated = (c as any as string)
          .replace(/^{iv:\"/, '')
          .replace(/",salt:"/, ',')
          .replace(/",ct:"/, ',')
          .replace(/\"}$/, '');
      return this.toWebsafe(commaSeparated);
    }

    public encrypt(plaintext: string): string {
      return this.crypt2sekrit(sjcl.encrypt(this.password, plaintext));
    }

    public decrypt(ciphertext: string): string {
      require(() => ciphertext);
      require(() => ciphertext.length >= 46);
      return sjcl.decrypt(this.password, this.sekrit2crypt(ciphertext));
    }

  }

  let assert, require;
  if (window.location.href.slice(0, 5) === 'file:') {
    console.log('Test Environment. Assertions enabled');
    assert = (predicate: () => boolean): void => {
      if (!predicate()) {
        throw 'Assertion failed. ' + predicate;
      }
    };
    require = (predicate: () => boolean): void => {
      if (!predicate()) {
        throw 'Precondition failed. ' + predicate;
      }
    };
  } else {
    assert = predicate => {};
    require = predicate => {};
  }

  const cirkleCipher = new Cipher('O', '', 'supersekrit');

  $(() => {
    $(window).on('hashchange', main);
    main();
    $('#create').click(() => {
      try {
        const friendly = $('#friendly').val().trim() || '(anonymous)';
        window.location.hash = '#' + createCirkle(friendly);
      } catch (e) {
        alert(e);
      }
    });
    const $textarea = $('textarea[readonly]');
    $textarea.mouseenter(() => $textarea.select());
  });

  function main(): void {
    const $content = $('#content');
    const cirkleString = fromHash();
    if (!cirkleString || cirkleString.length === 0) {
      dontHaveCirkle($content);
    } else {
      haveCirkle($content, cirkleString);
    }
  }

  function dontHaveCirkle($content): void {
    $('#no-circkle').slideDown();
    $('#bad-circkle').slideUp();
    $('#have-circkle').slideUp();
  }

  export function haveCirkle($content, cirkleString): void {
    $('.cirkle-name').text(cirkleString);
    let prefix, friendly;
    try {
      const ref = (cirkleCipher.decrypt(cirkleString)).split('|');
      prefix = ref[0];
      friendly = ref[1];
    } catch (e) {
      prefix = e;
      friendly = 'ERROR decrypting';
    }
    $('#no-circkle').slideUp();
    if (prefix !== CIRKLE_PREFIX) {
      $('#bad-circkle').slideDown();
      $('#have-circkle').slideUp();
    }
    $('title').text('Sekrit Cirkle: ' + friendly);
    $('.friendly-name').text(friendly);
    $('#cirkle-link').val(
      'Go to this web page to receive messages from the Sekrit Cirkle: ' +
          friendly + '\n' + window.location.href);
    $('#bad-circkle').slideUp();
    $('#have-circkle').slideDown();
    const cirkle = new Cipher('Shh:', '!', cirkleString);
    const $msgIn = $('#msg-in');
    $msgIn.keyup((): void => {
      afterTick((): void => {
        $('#sekrit-out').text(cirkle.encrypt($msgIn.val().trim()));
        $('#secret-out-wrapper').slideDown();
      });
    });
    const $sekritIn = $('#sekrit-in');
    $sekritIn.on('paste', () => {
      afterTick((): void => {
        const sekrit = $sekritIn.val().trim();
        try {
          $('#msg-out').text(cirkle.decrypt(sekrit));
          $('#msg-out-wrapper').slideDown();
        } catch (e) {
          // TODO(eob) fix this hack
          if (e.message !== 'ccm: tag doesn\'t match') {
            alert(e);
          }
        }
      });
    });
  }

  function fromHash(): string {
    return window.location.hash.substring(1);
  }

  function createCirkle(friendly): string {
    return cirkleCipher.encrypt(CIRKLE_PREFIX + '|' + friendly);
  }

  function afterTick(func): void {
    setTimeout(func, 0);
  }

}
