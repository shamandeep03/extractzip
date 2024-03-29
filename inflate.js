(function (global) {
  "use strict";

  var MAX_BITS = 15;

  var Z_OK = 0;
  var Z_STREAM_END = 1;
  var Z_NEED_DICT = 2;
  var Z_STREAM_ERROR = -2;
  var Z_DATA_ERROR = -3;
  var Z_MEM_ERROR = -4;
  var Z_BUF_ERROR = -5;

  var inflate_mask = [
    0x00000000, 0x00000001, 0x00000003, 0x00000007, 0x0000000f, 0x0000001f,
    0x0000003f, 0x0000007f, 0x000000ff, 0x000001ff, 0x000003ff, 0x000007ff,
    0x00000fff, 0x00001fff, 0x00003fff, 0x00007fff, 0x0000ffff,
  ];

  var MANY = 1440;

  var Z_NO_FLUSH = 0;
  var Z_FINISH = 4;

  var fixed_bl = 9;
  var fixed_bd = 5;

  var fixed_tl = [
    96, 7, 256, 0, 8, 80, 0, 8, 16, 84, 8, 115, 82, 7, 31, 0, 8, 112, 0, 8, 48,
    0, 9, 192, 80, 7, 10, 0, 8, 96, 0, 8, 32, 0, 9, 160, 0, 8, 0, 0, 8, 128, 0,
    8, 64, 0, 9, 224, 80, 7, 6, 0, 8, 88, 0, 8, 24, 0, 9, 144, 83, 7, 59, 0, 8,
    120, 0, 8, 56, 0, 9, 208, 81, 7, 17, 0, 8, 104, 0, 8, 40, 0, 9, 176, 0, 8,
    8, 0, 8, 136, 0, 8, 72, 0, 9, 240, 80, 7, 4, 0, 8, 84, 0, 8, 20, 85, 8, 227,
    83, 7, 43, 0, 8, 116, 0, 8, 52, 0, 9, 200, 81, 7, 13, 0, 8, 100, 0, 8, 36,
    0, 9, 168, 0, 8, 4, 0, 8, 132, 0, 8, 68, 0, 9, 232, 80, 7, 8, 0, 8, 92, 0,
    8, 28, 0, 9, 152, 84, 7, 83, 0, 8, 124, 0, 8, 60, 0, 9, 216, 82, 7, 23, 0,
    8, 108, 0, 8, 44, 0, 9, 184, 0, 8, 12, 0, 8, 140, 0, 8, 76, 0, 9, 248, 80,
    7, 3, 0, 8, 82, 0, 8, 18, 85, 8, 163, 83, 7, 35, 0, 8, 114, 0, 8, 50, 0, 9,
    196, 81, 7, 11, 0, 8, 98, 0, 8, 34, 0, 9, 164, 0, 8, 2, 0, 8, 130, 0, 8, 66,
    0, 9, 228, 80, 7, 7, 0, 8, 90, 0, 8, 26, 0, 9, 148, 84, 7, 67, 0, 8, 122, 0,
    8, 58, 0, 9, 212, 82, 7, 19, 0, 8, 106, 0, 8, 42, 0, 9, 180, 0, 8, 10, 0, 8,
    138, 0, 8, 74, 0, 9, 244, 80, 7, 5, 0, 8, 86, 0, 8, 22, 192, 8, 0, 83, 7,
    51, 0, 8, 118, 0, 8, 54, 0, 9, 204, 81, 7, 15, 0, 8, 102, 0, 8, 38, 0, 9,
    172, 0, 8, 6, 0, 8, 134, 0, 8, 70, 0, 9, 236, 80, 7, 9, 0, 8, 94, 0, 8, 30,
    0, 9, 156, 84, 7, 99, 0, 8, 126, 0, 8, 62, 0, 9, 220, 82, 7, 27, 0, 8, 110,
    0, 8, 46, 0, 9, 188, 0, 8, 14, 0, 8, 142, 0, 8, 78, 0, 9, 252, 96, 7, 256,
    0, 8, 81, 0, 8, 17, 85, 8, 131, 82, 7, 31, 0, 8, 113, 0, 8, 49, 0, 9, 194,
    80, 7, 10, 0, 8, 97, 0, 8, 33, 0, 9, 162, 0, 8, 1, 0, 8, 129, 0, 8, 65, 0,
    9, 226, 80, 7, 6, 0, 8, 89, 0, 8, 25, 0, 9, 146, 83, 7, 59, 0, 8, 121, 0, 8,
    57, 0, 9, 210, 81, 7, 17, 0, 8, 105, 0, 8, 41, 0, 9, 178, 0, 8, 9, 0, 8,
    137, 0, 8, 73, 0, 9, 242, 80, 7, 4, 0, 8, 85, 0, 8, 21, 80, 8, 258, 83, 7,
    43, 0, 8, 117, 0, 8, 53, 0, 9, 202, 81, 7, 13, 0, 8, 101, 0, 8, 37, 0, 9,
    170, 0, 8, 5, 0, 8, 133, 0, 8, 69, 0, 9, 234, 80, 7, 8, 0, 8, 93, 0, 8, 29,
    0, 9, 154, 84, 7, 83, 0, 8, 125, 0, 8, 61, 0, 9, 218, 82, 7, 23, 0, 8, 109,
    0, 8, 45, 0, 9, 186, 0, 8, 13, 0, 8, 141, 0, 8, 77, 0, 9, 250, 80, 7, 3, 0,
    8, 83, 0, 8, 19, 85, 8, 195, 83, 7, 35, 0, 8, 115, 0, 8, 51, 0, 9, 198, 81,
    7, 11, 0, 8, 99, 0, 8, 35, 0, 9, 166, 0, 8, 3, 0, 8, 131, 0, 8, 67, 0, 9,
    230, 80, 7, 7, 0, 8, 91, 0, 8, 27, 0, 9, 150, 84, 7, 67, 0, 8, 123, 0, 8,
    59, 0, 9, 214, 82, 7, 19, 0, 8, 107, 0, 8, 43, 0, 9, 182, 0, 8, 11, 0, 8,
    139, 0, 8, 75, 0, 9, 246, 80, 7, 5, 0, 8, 87, 0, 8, 23, 192, 8, 0, 83, 7,
    51, 0, 8, 119, 0, 8, 55, 0, 9, 206, 81, 7, 15, 0, 8, 103, 0, 8, 39, 0, 9,
    174, 0, 8, 7, 0, 8, 135, 0, 8, 71, 0, 9, 238, 80, 7, 9, 0, 8, 95, 0, 8, 31,
    0, 9, 158, 84, 7, 99, 0, 8, 127, 0, 8, 63, 0, 9, 222, 82, 7, 27, 0, 8, 111,
    0, 8, 47, 0, 9, 190, 0, 8, 15, 0, 8, 143, 0, 8, 79, 0, 9, 254, 96, 7, 256,
    0, 8, 80, 0, 8, 16, 84, 8, 115, 82, 7, 31, 0, 8, 112, 0, 8, 48, 0, 9, 193,
    80, 7, 10, 0, 8, 96, 0, 8, 32, 0, 9, 161, 0, 8, 0, 0, 8, 128, 0, 8, 64, 0,
    9, 225, 80, 7, 6, 0, 8, 88, 0, 8, 24, 0, 9, 145, 83, 7, 59, 0, 8, 120, 0, 8,
    56, 0, 9, 209, 81, 7, 17, 0, 8, 104, 0, 8, 40, 0, 9, 177, 0, 8, 8, 0, 8,
    136, 0, 8, 72, 0, 9, 241, 80, 7, 4, 0, 8, 84, 0, 8, 20, 85, 8, 227, 83, 7,
    43, 0, 8, 116, 0, 8, 52, 0, 9, 201, 81, 7, 13, 0, 8, 100, 0, 8, 36, 0, 9,
    169, 0, 8, 4, 0, 8, 132, 0, 8, 68, 0, 9, 233, 80, 7, 8, 0, 8, 92, 0, 8, 28,
    0, 9, 153, 84, 7, 83, 0, 8, 124, 0, 8, 60, 0, 9, 217, 82, 7, 23, 0, 8, 108,
    0, 8, 44, 0, 9, 185, 0, 8, 12, 0, 8, 140, 0, 8, 76, 0, 9, 249, 80, 7, 3, 0,
    8, 82, 0, 8, 18, 85, 8, 163, 83, 7, 35, 0, 8, 114, 0, 8, 50, 0, 9, 197, 81,
    7, 11, 0, 8, 98, 0, 8, 34, 0, 9, 165, 0, 8, 2, 0, 8, 130, 0, 8, 66, 0, 9,
    229, 80, 7, 7, 0, 8, 90, 0, 8, 26, 0, 9, 149, 84, 7, 67, 0, 8, 122, 0, 8,
    58, 0, 9, 213, 82, 7, 19, 0, 8, 106, 0, 8, 42, 0, 9, 181, 0, 8, 10, 0, 8,
    138, 0, 8, 74, 0, 9, 245, 80, 7, 5, 0, 8, 86, 0, 8, 22, 192, 8, 0, 83, 7,
    51, 0, 8, 118, 0, 8, 54, 0, 9, 205, 81, 7, 15, 0, 8, 102, 0, 8, 38, 0, 9,
    173, 0, 8, 6, 0, 8, 134, 0, 8, 70, 0, 9, 237, 80, 7, 9, 0, 8, 94, 0, 8, 30,
    0, 9, 157, 84, 7, 99, 0, 8, 126, 0, 8, 62, 0, 9, 221, 82, 7, 27, 0, 8, 110,
    0, 8, 46, 0, 9, 189, 0, 8, 14, 0, 8, 142, 0, 8, 78, 0, 9, 253, 96, 7, 256,
    0, 8, 81, 0, 8, 17, 85, 8, 131, 82, 7, 31, 0, 8, 113, 0, 8, 49, 0, 9, 195,
    80, 7, 10, 0, 8, 97, 0, 8, 33, 0, 9, 163, 0, 8, 1, 0, 8, 129, 0, 8, 65, 0,
    9, 227, 80, 7, 6, 0, 8, 89, 0, 8, 25, 0, 9, 147, 83, 7, 59, 0, 8, 121, 0, 8,
    57, 0, 9, 211, 81, 7, 17, 0, 8, 105, 0, 8, 41, 0, 9, 179, 0, 8, 9, 0, 8,
    137, 0, 8, 73, 0, 9, 243, 80, 7, 4, 0, 8, 85, 0, 8, 21, 80, 8, 258, 83, 7,
    43, 0, 8, 117, 0, 8, 53, 0, 9, 203, 81, 7, 13, 0, 8, 101, 0, 8, 37, 0, 9,
    171, 0, 8, 5, 0, 8, 133, 0, 8, 69, 0, 9, 235, 80, 7, 8, 0, 8, 93, 0, 8, 29,
    0, 9, 155, 84, 7, 83, 0, 8, 125, 0, 8, 61, 0, 9, 219, 82, 7, 23, 0, 8, 109,
    0, 8, 45, 0, 9, 187, 0, 8, 13, 0, 8, 141, 0, 8, 77, 0, 9, 251, 80, 7, 3, 0,
    8, 83, 0, 8, 19, 85, 8, 195, 83, 7, 35, 0, 8, 115, 0, 8, 51, 0, 9, 199, 81,
    7, 11, 0, 8, 99, 0, 8, 35, 0, 9, 167, 0, 8, 3, 0, 8, 131, 0, 8, 67, 0, 9,
    231, 80, 7, 7, 0, 8, 91, 0, 8, 27, 0, 9, 151, 84, 7, 67, 0, 8, 123, 0, 8,
    59, 0, 9, 215, 82, 7, 19, 0, 8, 107, 0, 8, 43, 0, 9, 183, 0, 8, 11, 0, 8,
    139, 0, 8, 75, 0, 9, 247, 80, 7, 5, 0, 8, 87, 0, 8, 23, 192, 8, 0, 83, 7,
    51, 0, 8, 119, 0, 8, 55, 0, 9, 207, 81, 7, 15, 0, 8, 103, 0, 8, 39, 0, 9,
    175, 0, 8, 7, 0, 8, 135, 0, 8, 71, 0, 9, 239, 80, 7, 9, 0, 8, 95, 0, 8, 31,
    0, 9, 159, 84, 7, 99, 0, 8, 127, 0, 8, 63, 0, 9, 223, 82, 7, 27, 0, 8, 111,
    0, 8, 47, 0, 9, 191, 0, 8, 15, 0, 8, 143, 0, 8, 79, 0, 9, 255,
  ];
  var fixed_td = [
    80, 5, 1, 87, 5, 257, 83, 5, 17, 91, 5, 4097, 81, 5, 5, 89, 5, 1025, 85, 5,
    65, 93, 5, 16385, 80, 5, 3, 88, 5, 513, 84, 5, 33, 92, 5, 8193, 82, 5, 9,
    90, 5, 2049, 86, 5, 129, 192, 5, 24577, 80, 5, 2, 87, 5, 385, 83, 5, 25, 91,
    5, 6145, 81, 5, 7, 89, 5, 1537, 85, 5, 97, 93, 5, 24577, 80, 5, 4, 88, 5,
    769, 84, 5, 49, 92, 5, 12289, 82, 5, 13, 90, 5, 3073, 86, 5, 193, 192, 5,
    24577,
  ];

  var cplens = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67,
    83, 99, 115, 131, 163, 195, 227, 258, 0, 0,
  ];

  var cplext = [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5,
    5, 5, 5, 0, 112, 112,
  ];

  var cpdist = [
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513,
    769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577,
  ];

  var cpdext = [
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
    11, 11, 12, 12, 13, 13,
  ];

  var BMAX = 15;
  function InfTree() {
    var that = this;

    var hn;
    var v;
    var c;
    var r;
    var u;
    var x;

    function huft_build(
      b,

      bindex,
      n,
      s,
      d,
      e,
      t,
      m,
      hp,
      hn,
      v
    ) {
      var a;
      var f;
      var g;
      var h;
      var i;
      var j;
      var k;
      var l;
      var mask;
      var p;
      var q;
      var w;
      var xp;
      var y;
      var z;

      p = 0;
      i = n;
      do {
        c[b[bindex + p]]++;
        p++;
        i--;
      } while (i !== 0);

      if (c[0] == n) {
        t[0] = -1;
        m[0] = 0;
        return Z_OK;
      }

      l = m[0];
      for (j = 1; j <= BMAX; j++) if (c[j] !== 0) break;
      k = j;
      if (l < j) {
        l = j;
      }
      for (i = BMAX; i !== 0; i--) {
        if (c[i] !== 0) break;
      }
      g = i;
      if (l > i) {
        l = i;
      }
      m[0] = l;

      for (y = 1 << j; j < i; j++, y <<= 1) {
        if ((y -= c[j]) < 0) {
          return Z_DATA_ERROR;
        }
      }
      if ((y -= c[i]) < 0) {
        return Z_DATA_ERROR;
      }
      c[i] += y;

      x[1] = j = 0;
      p = 1;
      xp = 2;
      while (--i !== 0) {
        x[xp] = j += c[p];
        xp++;
        p++;
      }

      i = 0;
      p = 0;
      do {
        if ((j = b[bindex + p]) !== 0) {
          v[x[j]++] = i;
        }
        p++;
      } while (++i < n);
      n = x[g];

      x[0] = i = 0;
      p = 0;
      h = -1;
      w = -l;
      u[0] = 0;
      q = 0;
      z = 0;
      for (; k <= g; k++) {
        a = c[k];
        while (a-- !== 0) {
          while (k > w + l) {
            h++;
            w += l;
            z = g - w;
            z = z > l ? l : z;
            if ((f = 1 << (j = k - w)) > a + 1) {
              f -= a + 1;
              xp = k;
              if (j < z) {
                while (++j < z) {
                  if ((f <<= 1) <= c[++xp]) break;
                  f -= c[xp];
                }
              }
            }
            z = 1 << j;

            if (hn[0] + z > MANY) {
              return Z_DATA_ERROR;
            }
            u[h] = q = hn[0];
            hn[0] += z;

            if (h !== 0) {
              x[h] = i;
              r[0] = j;
              r[1] = l;
              j = i >>> (w - l);
              r[2] = q - u[h - 1] - j;
              hp.set(r, (u[h - 1] + j) * 3);
            } else {
              t[0] = q;
            }
          }

          r[1] = k - w;
          if (p >= n) {
            r[0] = 128 + 64;
          } else if (v[p] < s) {
            r[0] = v[p] < 256 ? 0 : 32 + 64;

            r[2] = v[p++];
          } else {
            r[0] = e[v[p] - s] + 16 + 64;

            r[2] = d[v[p++] - s];
          }
          f = 1 << (k - w);
          for (j = i >>> w; j < z; j += f) {
            hp.set(r, (q + j) * 3);
          }
          for (j = 1 << (k - 1); (i & j) !== 0; j >>>= 1) {
            i ^= j;
          }
          i ^= j;
          mask = (1 << w) - 1;
          while ((i & mask) != x[h]) {
            h--;
            w -= l;
            mask = (1 << w) - 1;
          }
        }
      }

      return y !== 0 && g != 1 ? Z_BUF_ERROR : Z_OK;
    }

    function initWorkArea(vsize) {
      var i;
      if (!hn) {
        hn = [];
        v = [];
        c = new Int32Array(BMAX + 1);
        r = [];
        u = new Int32Array(BMAX);
        x = new Int32Array(BMAX + 1);
      }
      if (v.length < vsize) {
        v = [];
      }
      for (i = 0; i < vsize; i++) {
        v[i] = 0;
      }
      for (i = 0; i < BMAX + 1; i++) {
        c[i] = 0;
      }
      for (i = 0; i < 3; i++) {
        r[i] = 0;
      }

      u.set(c.subarray(0, BMAX), 0);
      x.set(c.subarray(0, BMAX + 1), 0);
    }

    that.inflate_trees_bits = function (c, bb, tb, hp, z) {
      var result;
      initWorkArea(19);
      hn[0] = 0;
      result = huft_build(c, 0, 19, 19, null, null, tb, bb, hp, hn, v);

      if (result == Z_DATA_ERROR) {
        z.msg = "oversubscribed dynamic bit lengths tree";
      } else if (result == Z_BUF_ERROR || bb[0] === 0) {
        z.msg = "incomplete dynamic bit lengths tree";
        result = Z_DATA_ERROR;
      }
      return result;
    };

    that.inflate_trees_dynamic = function (
      nl,
      nd,
      c,

      bl,
      bd,
      tl,
      td,
      hp,
      z
    ) {
      var result;

      initWorkArea(288);
      hn[0] = 0;
      result = huft_build(c, 0, nl, 257, cplens, cplext, tl, bl, hp, hn, v);
      if (result != Z_OK || bl[0] === 0) {
        if (result == Z_DATA_ERROR) {
          z.msg = "oversubscribed literal/length tree";
        } else if (result != Z_MEM_ERROR) {
          z.msg = "incomplete literal/length tree";
          result = Z_DATA_ERROR;
        }
        return result;
      }

      initWorkArea(288);
      result = huft_build(c, nl, nd, 0, cpdist, cpdext, td, bd, hp, hn, v);

      if (result != Z_OK || (bd[0] === 0 && nl > 257)) {
        if (result == Z_DATA_ERROR) {
          z.msg = "oversubscribed distance tree";
        } else if (result == Z_BUF_ERROR) {
          z.msg = "incomplete distance tree";
          result = Z_DATA_ERROR;
        } else if (result != Z_MEM_ERROR) {
          z.msg = "empty distance tree with lengths";
          result = Z_DATA_ERROR;
        }
        return result;
      }

      return Z_OK;
    };
  }

  InfTree.inflate_trees_fixed = function (bl, bd, tl, td) {
    bl[0] = fixed_bl;
    bd[0] = fixed_bd;
    tl[0] = fixed_tl;
    td[0] = fixed_td;
    return Z_OK;
  };

  var START = 0;
  var LEN = 1;
  var LENEXT = 2;
  var DIST = 3;
  var DISTEXT = 4;
  var COPY = 5;

  var LIT = 6;
  var WASH = 7;
  var END = 8;
  var BADCODE = 9;
  function InfCodes() {
    var that = this;

    var mode;
    var len = 0;

    var tree;
    var tree_index = 0;
    var need = 0;

    var lit = 0;

    var get = 0;
    var dist = 0;

    var lbits = 0;
    var dbits = 0;
    var ltree;
    var ltree_index = 0;
    var dtree;
    var dtree_index = 0;

    function inflate_fast(bl, bd, tl, tl_index, td, td_index, s, z) {
      var t;
      var tp;
      var tp_index;
      var e;
      var b;
      var k;
      var p;
      var n;
      var q;
      var m;
      var ml;
      var md;
      var c;
      var d;
      var r;

      var tp_index_t_3;
      p = z.next_in_index;
      n = z.avail_in;
      b = s.bitb;
      k = s.bitk;
      q = s.write;
      m = q < s.read ? s.read - q - 1 : s.end - q;

      ml = inflate_mask[bl];
      md = inflate_mask[bd];

      do {
        while (k < 20) {
          n--;
          b |= (z.read_byte(p++) & 0xff) << k;
          k += 8;
        }

        t = b & ml;
        tp = tl;
        tp_index = tl_index;
        tp_index_t_3 = (tp_index + t) * 3;
        if ((e = tp[tp_index_t_3]) === 0) {
          b >>= tp[tp_index_t_3 + 1];
          k -= tp[tp_index_t_3 + 1];

          s.window[q++] = tp[tp_index_t_3 + 2];
          m--;
          continue;
        }
        do {
          b >>= tp[tp_index_t_3 + 1];
          k -= tp[tp_index_t_3 + 1];

          if ((e & 16) !== 0) {
            e &= 15;
            c = tp[tp_index_t_3 + 2] + (b & inflate_mask[e]);

            b >>= e;
            k -= e;

            while (k < 15) {
              n--;
              b |= (z.read_byte(p++) & 0xff) << k;
              k += 8;
            }

            t = b & md;
            tp = td;
            tp_index = td_index;
            tp_index_t_3 = (tp_index + t) * 3;
            e = tp[tp_index_t_3];

            do {
              b >>= tp[tp_index_t_3 + 1];
              k -= tp[tp_index_t_3 + 1];

              if ((e & 16) !== 0) {
                e &= 15;
                while (k < e) {
                  n--;
                  b |= (z.read_byte(p++) & 0xff) << k;
                  k += 8;
                }

                d = tp[tp_index_t_3 + 2] + (b & inflate_mask[e]);

                b >>= e;
                k -= e;
                m -= c;
                if (q >= d) {
                  r = q - d;
                  if (q - r > 0 && 2 > q - r) {
                    s.window[q++] = s.window[r++];

                    s.window[q++] = s.window[r++];
                    c -= 2;
                  } else {
                    s.window.set(s.window.subarray(r, r + 2), q);
                    q += 2;
                    r += 2;
                    c -= 2;
                  }
                } else {
                  r = q - d;
                  do {
                    r += s.end;
                  } while (r < 0);
                  e = s.end - r;
                  if (c > e) {
                    c -= e;
                    if (q - r > 0 && e > q - r) {
                      do {
                        s.window[q++] = s.window[r++];
                      } while (--e !== 0);
                    } else {
                      s.window.set(s.window.subarray(r, r + e), q);
                      q += e;
                      r += e;
                      e = 0;
                    }
                    r = 0;
                  }
                }

                if (q - r > 0 && c > q - r) {
                  do {
                    s.window[q++] = s.window[r++];
                  } while (--c !== 0);
                } else {
                  s.window.set(s.window.subarray(r, r + c), q);
                  q += c;
                  r += c;
                  c = 0;
                }
                break;
              } else if ((e & 64) === 0) {
                t += tp[tp_index_t_3 + 2];
                t += b & inflate_mask[e];
                tp_index_t_3 = (tp_index + t) * 3;
                e = tp[tp_index_t_3];
              } else {
                z.msg = "invalid distance code";

                c = z.avail_in - n;
                c = k >> 3 < c ? k >> 3 : c;
                n += c;
                p -= c;
                k -= c << 3;

                s.bitb = b;
                s.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                s.write = q;

                return Z_DATA_ERROR;
              }
            } while (true);
            break;
          }

          if ((e & 64) === 0) {
            t += tp[tp_index_t_3 + 2];
            t += b & inflate_mask[e];
            tp_index_t_3 = (tp_index + t) * 3;
            if ((e = tp[tp_index_t_3]) === 0) {
              b >>= tp[tp_index_t_3 + 1];
              k -= tp[tp_index_t_3 + 1];

              s.window[q++] = /* (byte) */ tp[tp_index_t_3 + 2];
              m--;
              break;
            }
          } else if ((e & 32) !== 0) {
            c = z.avail_in - n;
            c = k >> 3 < c ? k >> 3 : c;
            n += c;
            p -= c;
            k -= c << 3;

            s.bitb = b;
            s.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            s.write = q;

            return Z_STREAM_END;
          } else {
            z.msg = "invalid literal/length code";

            c = z.avail_in - n;
            c = k >> 3 < c ? k >> 3 : c;
            n += c;
            p -= c;
            k -= c << 3;

            s.bitb = b;
            s.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            s.write = q;

            return Z_DATA_ERROR;
          }
        } while (true);
      } while (m >= 258 && n >= 10);

      c = z.avail_in - n;
      c = k >> 3 < c ? k >> 3 : c;
      n += c;
      p -= c;
      k -= c << 3;

      s.bitb = b;
      s.bitk = k;
      z.avail_in = n;
      z.total_in += p - z.next_in_index;
      z.next_in_index = p;
      s.write = q;

      return Z_OK;
    }

    that.init = function (bl, bd, tl, tl_index, td, td_index) {
      mode = START;
      lbits = /* (byte) */ bl;
      dbits = /* (byte) */ bd;
      ltree = tl;
      ltree_index = tl_index;
      dtree = td;
      dtree_index = td_index;
      tree = null;
    };

    that.proc = function (s, z, r) {
      var j;
      var tindex;
      var e;
      var b = 0;
      var k = 0;
      var p = 0;
      var n;
      var q;
      var m;
      var f;

      p = z.next_in_index;
      n = z.avail_in;
      b = s.bitb;
      k = s.bitk;
      q = s.write;
      m = q < s.read ? s.read - q - 1 : s.end - q;

      while (true) {
        switch (mode) {
          case START:
            if (m >= 258 && n >= 10) {
              s.bitb = b;
              s.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              s.write = q;
              r = inflate_fast(
                lbits,
                dbits,
                ltree,
                ltree_index,
                dtree,
                dtree_index,
                s,
                z
              );

              p = z.next_in_index;
              n = z.avail_in;
              b = s.bitb;
              k = s.bitk;
              q = s.write;
              m = q < s.read ? s.read - q - 1 : s.end - q;

              if (r != Z_OK) {
                mode = r == Z_STREAM_END ? WASH : BADCODE;
                break;
              }
            }
            need = lbits;
            tree = ltree;
            tree_index = ltree_index;

            mode = LEN;

          case LEN:
            j = need;

            while (k < j) {
              if (n !== 0) r = Z_OK;
              else {
                s.bitb = b;
                s.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                s.write = q;
                return s.inflate_flush(z, r);
              }
              n--;
              b |= (z.read_byte(p++) & 0xff) << k;
              k += 8;
            }

            tindex = (tree_index + (b & inflate_mask[j])) * 3;

            b >>>= tree[tindex + 1];
            k -= tree[tindex + 1];

            e = tree[tindex];

            if (e === 0) {
              lit = tree[tindex + 2];
              mode = LIT;
              break;
            }
            if ((e & 16) !== 0) {
              get = e & 15;
              len = tree[tindex + 2];
              mode = LENEXT;
              break;
            }
            if ((e & 64) === 0) {
              need = e;
              tree_index = tindex / 3 + tree[tindex + 2];
              break;
            }
            if ((e & 32) !== 0) {
              mode = WASH;
              break;
            }
            mode = BADCODE;
            z.msg = "invalid literal/length code";
            r = Z_DATA_ERROR;

            s.bitb = b;
            s.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            s.write = q;
            return s.inflate_flush(z, r);

          case LENEXT:
            j = get;

            while (k < j) {
              if (n !== 0) r = Z_OK;
              else {
                s.bitb = b;
                s.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                s.write = q;
                return s.inflate_flush(z, r);
              }
              n--;
              b |= (z.read_byte(p++) & 0xff) << k;
              k += 8;
            }

            len += b & inflate_mask[j];

            b >>= j;
            k -= j;

            need = dbits;
            tree = dtree;
            tree_index = dtree_index;
            mode = DIST;

          case DIST:
            j = need;

            while (k < j) {
              if (n !== 0) r = Z_OK;
              else {
                s.bitb = b;
                s.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                s.write = q;
                return s.inflate_flush(z, r);
              }
              n--;
              b |= (z.read_byte(p++) & 0xff) << k;
              k += 8;
            }

            tindex = (tree_index + (b & inflate_mask[j])) * 3;

            b >>= tree[tindex + 1];
            k -= tree[tindex + 1];

            e = tree[tindex];
            if ((e & 16) !== 0) {
              get = e & 15;
              dist = tree[tindex + 2];
              mode = DISTEXT;
              break;
            }
            if ((e & 64) === 0) {
              need = e;
              tree_index = tindex / 3 + tree[tindex + 2];
              break;
            }
            mode = BADCODE;
            z.msg = "invalid distance code";
            r = Z_DATA_ERROR;

            s.bitb = b;
            s.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            s.write = q;
            return s.inflate_flush(z, r);

          case DISTEXT:
            j = get;

            while (k < j) {
              if (n !== 0) r = Z_OK;
              else {
                s.bitb = b;
                s.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                s.write = q;
                return s.inflate_flush(z, r);
              }
              n--;
              b |= (z.read_byte(p++) & 0xff) << k;
              k += 8;
            }

            dist += b & inflate_mask[j];

            b >>= j;
            k -= j;

            mode = COPY;

          case COPY:
            f = q - dist;
            while (f < 0) {
              f += s.end;
            }
            while (len !== 0) {
              if (m === 0) {
                if (q == s.end && s.read !== 0) {
                  q = 0;
                  m = q < s.read ? s.read - q - 1 : s.end - q;
                }
                if (m === 0) {
                  s.write = q;
                  r = s.inflate_flush(z, r);
                  q = s.write;
                  m = q < s.read ? s.read - q - 1 : s.end - q;

                  if (q == s.end && s.read !== 0) {
                    q = 0;
                    m = q < s.read ? s.read - q - 1 : s.end - q;
                  }

                  if (m === 0) {
                    s.bitb = b;
                    s.bitk = k;
                    z.avail_in = n;
                    z.total_in += p - z.next_in_index;
                    z.next_in_index = p;
                    s.write = q;
                    return s.inflate_flush(z, r);
                  }
                }
              }

              s.window[q++] = s.window[f++];
              m--;

              if (f == s.end) f = 0;
              len--;
            }
            mode = START;
            break;
          case LIT:
            if (m === 0) {
              if (q == s.end && s.read !== 0) {
                q = 0;
                m = q < s.read ? s.read - q - 1 : s.end - q;
              }
              if (m === 0) {
                s.write = q;
                r = s.inflate_flush(z, r);
                q = s.write;
                m = q < s.read ? s.read - q - 1 : s.end - q;

                if (q == s.end && s.read !== 0) {
                  q = 0;
                  m = q < s.read ? s.read - q - 1 : s.end - q;
                }
                if (m === 0) {
                  s.bitb = b;
                  s.bitk = k;
                  z.avail_in = n;
                  z.total_in += p - z.next_in_index;
                  z.next_in_index = p;
                  s.write = q;
                  return s.inflate_flush(z, r);
                }
              }
            }
            r = Z_OK;

            s.window[q++] = lit;
            m--;

            mode = START;
            break;
          case WASH:
            if (k > 7) {
              k -= 8;
              n++;
              p--;
            }

            s.write = q;
            r = s.inflate_flush(z, r);
            q = s.write;
            m = q < s.read ? s.read - q - 1 : s.end - q;

            if (s.read != s.write) {
              s.bitb = b;
              s.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              s.write = q;
              return s.inflate_flush(z, r);
            }
            mode = END;

          case END:
            r = Z_STREAM_END;
            s.bitb = b;
            s.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            s.write = q;
            return s.inflate_flush(z, r);

          case BADCODE:
            r = Z_DATA_ERROR;

            s.bitb = b;
            s.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            s.write = q;
            return s.inflate_flush(z, r);

          default:
            r = Z_STREAM_ERROR;

            s.bitb = b;
            s.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            s.write = q;
            return s.inflate_flush(z, r);
        }
      }
    };

    that.free = function () {};
  }

  var border = [
    16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
  ];

  var TYPE = 0;
  var LENS = 1;
  var STORED = 2;
  var TABLE = 3;
  var BTREE = 4;

  var DTREE = 5;

  var CODES = 6;
  var DRY = 7;
  var DONELOCKS = 8;
  var BADBLOCKS = 9;

  function InfBlocks(z, w) {
    var that = this;

    var mode = TYPE;

    var left = 0;

    var table = 0;
    var index = 0;
    var blens;
    var bb = [0];
    var tb = [0];

    var codes = new InfCodes();
    var last = 0;
    var hufts = new Int32Array(MANY * 3);
    var check = 0;
    var inftree = new InfTree();

    that.bitk = 0;
    that.bitb = 0;
    that.window = new Uint8Array(w);
    that.end = w;
    that.read = 0;
    that.write = 0;

    that.reset = function (z, c) {
      if (c) c[0] = check;
      if (mode == CODES) {
        codes.free(z);
      }
      mode = TYPE;
      that.bitk = 0;
      that.bitb = 0;
      that.read = that.write = 0;
    };

    that.reset(z, null);

    that.inflate_flush = function (z, r) {
      var n;
      var p;
      var q;

      p = z.next_out_index;
      q = that.read;

      n = (q <= that.write ? that.write : that.end) - q;
      if (n > z.avail_out) n = z.avail_out;
      if (n !== 0 && r == Z_BUF_ERROR) r = Z_OK;

      z.avail_out -= n;
      z.total_out += n;

      z.next_out.set(that.window.subarray(q, q + n), p);
      p += n;
      q += n;

      if (q == that.end) {
        q = 0;
        if (that.write == that.end) that.write = 0;

        n = that.write - q;
        if (n > z.avail_out) n = z.avail_out;
        if (n !== 0 && r == Z_BUF_ERROR) r = Z_OK;

        z.avail_out -= n;
        z.total_out += n;

        z.next_out.set(that.window.subarray(q, q + n), p);
        p += n;
        q += n;
      }

      z.next_out_index = p;
      that.read = q;

      return r;
    };

    that.proc = function (z, r) {
      var t;
      var b;
      var k;
      var p;
      var n;
      var q;
      var m;
      var i;

      p = z.next_in_index;
      n = z.avail_in;
      b = that.bitb;
      k = that.bitk;

      q = that.write;
      m = q < that.read ? that.read - q - 1 : that.end - q;
      while (true) {
        switch (mode) {
          case TYPE:
            while (k < 3) {
              if (n !== 0) {
                r = Z_OK;
              } else {
                that.bitb = b;
                that.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                that.write = q;
                return that.inflate_flush(z, r);
              }
              n--;
              b |= (z.read_byte(p++) & 0xff) << k;
              k += 8;
            }
            t = b & 7;
            last = t & 1;

            switch (t >>> 1) {
              case 0:
                b >>>= 3;
                k -= 3;
                t = k & 7;
                b >>>= t;
                k -= t;
                mode = LENS;
                break;
              case 1:
                var bl = [];
                var bd = [];
                var tl = [[]];
                var td = [[]];

                InfTree.inflate_trees_fixed(bl, bd, tl, td);
                codes.init(bl[0], bd[0], tl[0], 0, td[0], 0);

                b >>>= 3;
                k -= 3;

                mode = CODES;
                break;
              case 2:
                b >>>= 3;
                k -= 3;

                mode = TABLE;
                break;
              case 3:
                b >>>= 3;
                k -= 3;

                mode = BADBLOCKS;
                z.msg = "invalid block type";
                r = Z_DATA_ERROR;

                that.bitb = b;
                that.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                that.write = q;
                return that.inflate_flush(z, r);
            }
            break;
          case LENS:
            while (k < 32) {
              if (n !== 0) {
                r = Z_OK;
              } else {
                that.bitb = b;
                that.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                that.write = q;
                return that.inflate_flush(z, r);
              }
              n--;
              b |= (z.read_byte(p++) & 0xff) << k;
              k += 8;
            }

            if (((~b >>> 16) & 0xffff) != (b & 0xffff)) {
              mode = BADBLOCKS;
              z.msg = "invalid stored block lengths";
              r = Z_DATA_ERROR;

              that.bitb = b;
              that.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z, r);
            }
            left = b & 0xffff;
            b = k = 0;
            mode = left !== 0 ? STORED : last !== 0 ? DRY : TYPE;
            break;
          case STORED:
            if (n === 0) {
              that.bitb = b;
              that.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z, r);
            }

            if (m === 0) {
              if (q == that.end && that.read !== 0) {
                q = 0;
                m =
                  /* (int) */ q < that.read ? that.read - q - 1 : that.end - q;
              }
              if (m === 0) {
                that.write = q;
                r = that.inflate_flush(z, r);
                q = that.write;
                m =
                  /* (int) */ q < that.read ? that.read - q - 1 : that.end - q;
                if (q == that.end && that.read !== 0) {
                  q = 0;
                  m =
                    /* (int) */ q < that.read
                      ? that.read - q - 1
                      : that.end - q;
                }
                if (m === 0) {
                  that.bitb = b;
                  that.bitk = k;
                  z.avail_in = n;
                  z.total_in += p - z.next_in_index;
                  z.next_in_index = p;
                  that.write = q;
                  return that.inflate_flush(z, r);
                }
              }
            }
            r = Z_OK;

            t = left;
            if (t > n) t = n;
            if (t > m) t = m;
            that.window.set(z.read_buf(p, t), q);
            p += t;
            n -= t;
            q += t;
            m -= t;
            if ((left -= t) !== 0) break;
            mode = last !== 0 ? DRY : TYPE;
            break;
          case TABLE:
            while (k < 14) {
              if (n !== 0) {
                r = Z_OK;
              } else {
                that.bitb = b;
                that.bitk = k;
                z.avail_in = n;
                z.total_in += p - z.next_in_index;
                z.next_in_index = p;
                that.write = q;
                return that.inflate_flush(z, r);
              }

              n--;
              b |= (z.read_byte(p++) & 0xff) << k;
              k += 8;
            }

            table = t = b & 0x3fff;
            if ((t & 0x1f) > 29 || ((t >> 5) & 0x1f) > 29) {
              mode = BADBLOCKS;
              z.msg = "too many length or distance symbols";
              r = Z_DATA_ERROR;

              that.bitb = b;
              that.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z, r);
            }
            t = 258 + (t & 0x1f) + ((t >> 5) & 0x1f);
            if (!blens || blens.length < t) {
              blens = [];
            } else {
              for (i = 0; i < t; i++) {
                blens[i] = 0;
              }
            }

            b >>>= 14;
            k -= 14;

            index = 0;
            mode = BTREE;
          case BTREE:
            while (index < 4 + (table >>> 10)) {
              while (k < 3) {
                if (n !== 0) {
                  r = Z_OK;
                } else {
                  that.bitb = b;
                  that.bitk = k;
                  z.avail_in = n;
                  z.total_in += p - z.next_in_index;
                  z.next_in_index = p;
                  that.write = q;
                  return that.inflate_flush(z, r);
                }
                n--;
                b |= (z.read_byte(p++) & 0xff) << k;
                k += 8;
              }

              blens[border[index++]] = b & 7;

              b >>>= 3;
              k -= 3;
            }

            while (index < 19) {
              blens[border[index++]] = 0;
            }

            bb[0] = 7;
            t = inftree.inflate_trees_bits(blens, bb, tb, hufts, z);
            if (t != Z_OK) {
              r = t;
              if (r == Z_DATA_ERROR) {
                blens = null;
                mode = BADBLOCKS;
              }

              that.bitb = b;
              that.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z, r);
            }

            index = 0;
            mode = DTREE;
          /* falls through */
          case DTREE:
            while (true) {
              t = table;
              if (index >= 258 + (t & 0x1f) + ((t >> 5) & 0x1f)) {
                break;
              }

              var j, c;

              t = bb[0];

              while (k < t) {
                if (n !== 0) {
                  r = Z_OK;
                } else {
                  that.bitb = b;
                  that.bitk = k;
                  z.avail_in = n;
                  z.total_in += p - z.next_in_index;
                  z.next_in_index = p;
                  that.write = q;
                  return that.inflate_flush(z, r);
                }
                n--;
                b |= (z.read_byte(p++) & 0xff) << k;
                k += 8;
              }

              t = hufts[(tb[0] + (b & inflate_mask[t])) * 3 + 1];
              c = hufts[(tb[0] + (b & inflate_mask[t])) * 3 + 2];

              if (c < 16) {
                b >>>= t;
                k -= t;
                blens[index++] = c;
              } else {
                i = c == 18 ? 7 : c - 14;
                j = c == 18 ? 11 : 3;

                while (k < t + i) {
                  if (n !== 0) {
                    r = Z_OK;
                  } else {
                    that.bitb = b;
                    that.bitk = k;
                    z.avail_in = n;
                    z.total_in += p - z.next_in_index;
                    z.next_in_index = p;
                    that.write = q;
                    return that.inflate_flush(z, r);
                  }
                  n--;
                  b |= (z.read_byte(p++) & 0xff) << k;
                  k += 8;
                }

                b >>>= t;
                k -= t;

                j += b & inflate_mask[i];

                b >>>= i;
                k -= i;

                i = index;
                t = table;
                if (
                  i + j > 258 + (t & 0x1f) + ((t >> 5) & 0x1f) ||
                  (c == 16 && i < 1)
                ) {
                  blens = null;
                  mode = BADBLOCKS;
                  z.msg = "invalid bit length repeat";
                  r = Z_DATA_ERROR;

                  that.bitb = b;
                  that.bitk = k;
                  z.avail_in = n;
                  z.total_in += p - z.next_in_index;
                  z.next_in_index = p;
                  that.write = q;
                  return that.inflate_flush(z, r);
                }

                c = c == 16 ? blens[i - 1] : 0;
                do {
                  blens[i++] = c;
                } while (--j !== 0);
                index = i;
              }
            }

            tb[0] = -1;

            var bl_ = [];
            var bd_ = [];
            var tl_ = [];
            var td_ = [];
            bl_[0] = 9;
            bd_[0] = 6;

            t = table;
            t = inftree.inflate_trees_dynamic(
              257 + (t & 0x1f),
              1 + ((t >> 5) & 0x1f),
              blens,
              bl_,
              bd_,
              tl_,
              td_,
              hufts,
              z
            );

            if (t != Z_OK) {
              if (t == Z_DATA_ERROR) {
                blens = null;
                mode = BADBLOCKS;
              }
              r = t;

              that.bitb = b;
              that.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z, r);
            }
            codes.init(bl_[0], bd_[0], hufts, tl_[0], hufts, td_[0]);

            mode = CODES;

          case CODES:
            that.bitb = b;
            that.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            that.write = q;

            if ((r = codes.proc(that, z, r)) != Z_STREAM_END) {
              return that.inflate_flush(z, r);
            }
            r = Z_OK;
            codes.free(z);

            p = z.next_in_index;
            n = z.avail_in;
            b = that.bitb;
            k = that.bitk;
            q = that.write;
            m = /* (int) */ q < that.read ? that.read - q - 1 : that.end - q;

            if (last === 0) {
              mode = TYPE;
              break;
            }
            mode = DRY;
          /* falls through */
          case DRY:
            that.write = q;
            r = that.inflate_flush(z, r);
            q = that.write;
            m = /* (int) */ q < that.read ? that.read - q - 1 : that.end - q;
            if (that.read != that.write) {
              that.bitb = b;
              that.bitk = k;
              z.avail_in = n;
              z.total_in += p - z.next_in_index;
              z.next_in_index = p;
              that.write = q;
              return that.inflate_flush(z, r);
            }
            mode = DONELOCKS;
          /* falls through */
          case DONELOCKS:
            r = Z_STREAM_END;

            that.bitb = b;
            that.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            that.write = q;
            return that.inflate_flush(z, r);
          case BADBLOCKS:
            r = Z_DATA_ERROR;

            that.bitb = b;
            that.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            that.write = q;
            return that.inflate_flush(z, r);

          default:
            r = Z_STREAM_ERROR;

            that.bitb = b;
            that.bitk = k;
            z.avail_in = n;
            z.total_in += p - z.next_in_index;
            z.next_in_index = p;
            that.write = q;
            return that.inflate_flush(z, r);
        }
      }
    };

    that.free = function (z) {
      that.reset(z, null);
      that.window = null;
      hufts = null;
    };

    that.set_dictionary = function (d, start, n) {
      that.window.set(d.subarray(start, start + n), 0);
      that.read = that.write = n;
    };

    that.sync_point = function () {
      return mode == LENS ? 1 : 0;
    };
  }
  var PRESET_DICT = 0x20;

  var Z_DEFLATED = 8;

  var METHOD = 0;
  var FLAG = 1;
  var DICT4 = 2;
  var DICT3 = 3;
  var DICT2 = 4;
  var DICT1 = 5;
  var DICT0 = 6;
  var BLOCKS = 7;
  var DONE = 12;
  var BAD = 13;

  var mark = [0, 0, 0xff, 0xff];

  function Inflate() {
    var that = this;

    that.mode = 0;

    that.method = 0;
    that.was = [0];
    that.need = 0;
    that.marker = 0;
    that.wbits = 0;
    function inflateReset(z) {
      if (!z || !z.istate) return Z_STREAM_ERROR;

      z.total_in = z.total_out = 0;
      z.msg = null;
      z.istate.mode = BLOCKS;
      z.istate.blocks.reset(z, null);
      return Z_OK;
    }

    that.inflateEnd = function (z) {
      if (that.blocks) that.blocks.free(z);
      that.blocks = null;

      return Z_OK;
    };

    that.inflateInit = function (z, w) {
      z.msg = null;
      that.blocks = null;
      if (w < 8 || w > 15) {
        that.inflateEnd(z);
        return Z_STREAM_ERROR;
      }
      that.wbits = w;

      z.istate.blocks = new InfBlocks(z, 1 << w);
      inflateReset(z);
      return Z_OK;
    };

    that.inflate = function (z, f) {
      var r;
      var b;

      if (!z || !z.istate || !z.next_in) return Z_STREAM_ERROR;
      f = f == Z_FINISH ? Z_BUF_ERROR : Z_OK;
      r = Z_BUF_ERROR;
      while (true) {
        switch (z.istate.mode) {
          case METHOD:
            if (z.avail_in === 0) return r;
            r = f;

            z.avail_in--;
            z.total_in++;
            if (
              ((z.istate.method = z.read_byte(z.next_in_index++)) & 0xf) !=
              Z_DEFLATED
            ) {
              z.istate.mode = BAD;
              z.msg = "unknown compression method";
              z.istate.marker = 5;
              break;
            }
            if ((z.istate.method >> 4) + 8 > z.istate.wbits) {
              z.istate.mode = BAD;
              z.msg = "invalid window size";
              z.istate.marker = 5;
              break;
            }
            z.istate.mode = FLAG;

          case FLAG:
            if (z.avail_in === 0) return r;
            r = f;

            z.avail_in--;
            z.total_in++;
            b = z.read_byte(z.next_in_index++) & 0xff;

            if (((z.istate.method << 8) + b) % 31 !== 0) {
              z.istate.mode = BAD;
              z.msg = "incorrect header check";
              z.istate.marker = 5;
              break;
            }

            if ((b & PRESET_DICT) === 0) {
              z.istate.mode = BLOCKS;
              break;
            }
            z.istate.mode = DICT4;

          case DICT4:
            if (z.avail_in === 0) return r;
            r = f;

            z.avail_in--;
            z.total_in++;
            z.istate.need =
              ((z.read_byte(z.next_in_index++) & 0xff) << 24) & 0xff000000;
            z.istate.mode = DICT3;

          case DICT3:
            if (z.avail_in === 0) return r;
            r = f;

            z.avail_in--;
            z.total_in++;
            z.istate.need +=
              ((z.read_byte(z.next_in_index++) & 0xff) << 16) & 0xff0000;
            z.istate.mode = DICT2;

          case DICT2:
            if (z.avail_in === 0) return r;
            r = f;

            z.avail_in--;
            z.total_in++;
            z.istate.need +=
              ((z.read_byte(z.next_in_index++) & 0xff) << 8) & 0xff00;
            z.istate.mode = DICT1;

          case DICT1:
            if (z.avail_in === 0) return r;
            r = f;

            z.avail_in--;
            z.total_in++;
            z.istate.need += z.read_byte(z.next_in_index++) & 0xff;
            z.istate.mode = DICT0;
            return Z_NEED_DICT;
          case DICT0:
            z.istate.mode = BAD;
            z.msg = "need dictionary";
            z.istate.marker = 0;
            return Z_STREAM_ERROR;
          case BLOCKS:
            r = z.istate.blocks.proc(z, r);
            if (r == Z_DATA_ERROR) {
              z.istate.mode = BAD;
              z.istate.marker = 0;
              break;
            }
            if (r == Z_OK) {
              r = f;
            }
            if (r != Z_STREAM_END) {
              return r;
            }
            r = f;
            z.istate.blocks.reset(z, z.istate.was);
            z.istate.mode = DONE;

          case DONE:
            return Z_STREAM_END;
          case BAD:
            return Z_DATA_ERROR;
          default:
            return Z_STREAM_ERROR;
        }
      }
    };

    that.inflateSetDictionary = function (z, dictionary, dictLength) {
      var index = 0;
      var length = dictLength;
      if (!z || !z.istate || z.istate.mode != DICT0) return Z_STREAM_ERROR;

      if (length >= 1 << z.istate.wbits) {
        length = (1 << z.istate.wbits) - 1;
        index = dictLength - length;
      }
      z.istate.blocks.set_dictionary(dictionary, index, length);
      z.istate.mode = BLOCKS;
      return Z_OK;
    };

    that.inflateSync = function (z) {
      var n;
      var p;
      var m;
      var r, w;
      if (!z || !z.istate) return Z_STREAM_ERROR;
      if (z.istate.mode != BAD) {
        z.istate.mode = BAD;
        z.istate.marker = 0;
      }
      if ((n = z.avail_in) === 0) return Z_BUF_ERROR;
      p = z.next_in_index;
      m = z.istate.marker;

      while (n !== 0 && m < 4) {
        if (z.read_byte(p) == mark[m]) {
          m++;
        } else if (z.read_byte(p) !== 0) {
          m = 0;
        } else {
          m = 4 - m;
        }
        p++;
        n--;
      }

      z.total_in += p - z.next_in_index;
      z.next_in_index = p;
      z.avail_in = n;
      z.istate.marker = m;

      if (m != 4) {
        return Z_DATA_ERROR;
      }
      r = z.total_in;
      w = z.total_out;
      inflateReset(z);
      z.total_in = r;
      z.total_out = w;
      z.istate.mode = BLOCKS;
      return Z_OK;
    };

    that.inflateSyncPoint = function (z) {
      if (!z || !z.istate || !z.istate.blocks) return Z_STREAM_ERROR;
      return z.istate.blocks.sync_point();
    };
  }

  function ZStream() {}

  ZStream.prototype = {
    inflateInit: function (bits) {
      var that = this;
      that.istate = new Inflate();
      if (!bits) bits = MAX_BITS;
      return that.istate.inflateInit(that, bits);
    },

    inflate: function (f) {
      var that = this;
      if (!that.istate) return Z_STREAM_ERROR;
      return that.istate.inflate(that, f);
    },

    inflateEnd: function () {
      var that = this;
      if (!that.istate) return Z_STREAM_ERROR;
      var ret = that.istate.inflateEnd(that);
      that.istate = null;
      return ret;
    },

    inflateSync: function () {
      var that = this;
      if (!that.istate) return Z_STREAM_ERROR;
      return that.istate.inflateSync(that);
    },
    inflateSetDictionary: function (dictionary, dictLength) {
      var that = this;
      if (!that.istate) return Z_STREAM_ERROR;
      return that.istate.inflateSetDictionary(that, dictionary, dictLength);
    },
    read_byte: function (start) {
      var that = this;
      return that.next_in.subarray(start, start + 1)[0];
    },
    read_buf: function (start, size) {
      var that = this;
      return that.next_in.subarray(start, start + size);
    },
  };

  function Inflater() {
    var that = this;
    var z = new ZStream();
    var bufsize = 512;
    var flush = Z_NO_FLUSH;
    var buf = new Uint8Array(bufsize);
    var nomoreinput = false;

    z.inflateInit();
    z.next_out = buf;

    that.append = function (data, onprogress) {
      var err,
        buffers = [],
        lastIndex = 0,
        bufferIndex = 0,
        bufferSize = 0,
        array;
      if (data.length === 0) return;
      z.next_in_index = 0;
      z.next_in = data;
      z.avail_in = data.length;
      do {
        z.next_out_index = 0;
        z.avail_out = bufsize;
        if (z.avail_in === 0 && !nomoreinput) {
          z.next_in_index = 0;
          nomoreinput = true;
        }
        err = z.inflate(flush);
        if (nomoreinput && err === Z_BUF_ERROR) {
          if (z.avail_in !== 0) throw new Error("inflating: bad input");
        } else if (err !== Z_OK && err !== Z_STREAM_END)
          throw new Error("inflating: " + z.msg);
        if ((nomoreinput || err === Z_STREAM_END) && z.avail_in === data.length)
          throw new Error("inflating: bad input");
        if (z.next_out_index)
          if (z.next_out_index === bufsize) buffers.push(new Uint8Array(buf));
          else buffers.push(new Uint8Array(buf.subarray(0, z.next_out_index)));
        bufferSize += z.next_out_index;
        if (onprogress && z.next_in_index > 0 && z.next_in_index != lastIndex) {
          onprogress(z.next_in_index);
          lastIndex = z.next_in_index;
        }
      } while (z.avail_in > 0 || z.avail_out === 0);
      array = new Uint8Array(bufferSize);
      buffers.forEach(function (chunk) {
        array.set(chunk, bufferIndex);
        bufferIndex += chunk.length;
      });
      return array;
    };
    that.flush = function () {
      z.inflateEnd();
    };
  }

  var env = global.zip || global;
  env.Inflater = env._jzlib_Inflater = Inflater;
})(this);
