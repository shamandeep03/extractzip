/*
 Copyright (c) 2013 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright 
 notice, this list of conditions and the following disclaimer in 
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * This program is based on JZlib 1.0.2 ymnk, JCraft,Inc.
 * JZlib is based on zlib-1.1.3, so all credit should go authors
 * Jean-loup Gailly(jloup@gzip.org) and Mark Adler(madler@alumni.caltech.edu)
 * and contributors of zlib.
 */

(function (global) {
  "use strict";

  var MAX_BITS = 15;
  var D_CODES = 30;
  var BL_CODES = 19;

  var LENGTH_CODES = 29;
  var LITERALS = 256;
  var L_CODES = LITERALS + 1 + LENGTH_CODES;
  var HEAP_SIZE = 2 * L_CODES + 1;

  var END_BLOCK = 256;

  var MAX_BL_BITS = 7;

  var REP_3_6 = 16;

  var REPZ_3_10 = 17;

  var REPZ_11_138 = 18;

  var Buf_size = 8 * 2;

  var Z_DEFAULT_COMPRESSION = -1;

  var Z_FILTERED = 1;
  var Z_HUFFMAN_ONLY = 2;
  var Z_DEFAULT_STRATEGY = 0;

  var Z_NO_FLUSH = 0;
  var Z_PARTIAL_FLUSH = 1;
  var Z_FULL_FLUSH = 3;
  var Z_FINISH = 4;

  var Z_OK = 0;
  var Z_STREAM_END = 1;
  var Z_NEED_DICT = 2;
  var Z_STREAM_ERROR = -2;
  var Z_DATA_ERROR = -3;
  var Z_BUF_ERROR = -5;

  var _dist_code = [
    0, 1, 2, 3, 4, 4, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 9,
    9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
    10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12,
    12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12,
    12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13,
    13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13,
    13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
    14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
    14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14,
    14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 0, 0, 16, 17, 18, 18, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 22, 22,
    22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25,
    25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
    26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
    26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27,
    27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29,
    29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29,
    29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29,
    29, 29, 29, 29, 29, 29, 29, 29, 29, 29,
  ];

  function Tree() {
    var that = this;
    function gen_bitlen(s) {
      var tree = that.dyn_tree;
      var stree = that.stat_desc.static_tree;
      var extra = that.stat_desc.extra_bits;
      var base = that.stat_desc.extra_base;
      var max_length = that.stat_desc.max_length;
      var h;
      var n, m;
      var bits;
      var xbits;
      var f;
      var overflow = 0;
      for (bits = 0; bits <= MAX_BITS; bits++) s.bl_count[bits] = 0;
      tree[s.heap[s.heap_max] * 2 + 1] = 0;

      for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1] = bits;
        if (n > that.max_code) continue;

        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) xbits = extra[n - base];
        f = tree[n * 2];
        s.opt_len += f * (bits + xbits);
        if (stree) s.static_len += f * (stree[n * 2 + 1] + xbits);
      }
      if (overflow === 0) return;
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] === 0) bits--;
        s.bl_count[bits]--;
        s.bl_count[bits + 1] += 2;
        s.bl_count[max_length]--;
        overflow -= 2;
      } while (overflow > 0);

      for (bits = max_length; bits !== 0; bits--) {
        n = s.bl_count[bits];
        while (n !== 0) {
          m = s.heap[--h];
          if (m > that.max_code) continue;
          if (tree[m * 2 + 1] != bits) {
            s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
            tree[m * 2 + 1] = bits;
          }
          n--;
        }
      }
    }

    function bi_reverse(code, len) {
      var res = 0;
      do {
        res |= code & 1;
        code >>>= 1;
        res <<= 1;
      } while (--len > 0);
      return res >>> 1;
    }

    function gen_codes(tree, max_code, bl_count) {
      var next_code = [];
      var code = 0;
      var bits;
      var n;
      var len;

      for (bits = 1; bits <= MAX_BITS; bits++) {
        next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
      }

      for (n = 0; n <= max_code; n++) {
        len = tree[n * 2 + 1];
        if (len === 0) continue;
        tree[n * 2] = bi_reverse(next_code[len]++, len);
      }
    }

    that.build_tree = function (s) {
      var tree = that.dyn_tree;
      var stree = that.stat_desc.static_tree;
      var elems = that.stat_desc.elems;
      var n, m;
      var max_code = -1;
      var node;

      s.heap_len = 0;
      s.heap_max = HEAP_SIZE;

      for (n = 0; n < elems; n++) {
        if (tree[n * 2] !== 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;
        } else {
          tree[n * 2 + 1] = 0;
        }
      }

      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
        tree[node * 2] = 1;
        s.depth[node] = 0;
        s.opt_len--;
        if (stree) s.static_len -= stree[node * 2 + 1];
      }
      that.max_code = max_code;

      for (n = Math.floor(s.heap_len / 2); n >= 1; n--) s.pqdownheap(tree, n);

      node = elems;
      do {
        n = s.heap[1];
        s.heap[1] = s.heap[s.heap_len--];
        s.pqdownheap(tree, 1);
        m = s.heap[1];

        s.heap[--s.heap_max] = n;
        s.heap[--s.heap_max] = m;

        tree[node * 2] = tree[n * 2] + tree[m * 2];
        s.depth[node] = Math.max(s.depth[n], s.depth[m]) + 1;
        tree[n * 2 + 1] = tree[m * 2 + 1] = node;

        s.heap[1] = node++;
        s.pqdownheap(tree, 1);
      } while (s.heap_len >= 2);

      s.heap[--s.heap_max] = s.heap[1];
      gen_bitlen(s);
      gen_codes(tree, that.max_code, s.bl_count);
    };
  }

  Tree._length_code = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13,
    13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 17,
    17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19,
    19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25,
    25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26,
    26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26,
    26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27,
    27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27,
    27, 27, 27, 27, 27, 28,
  ];

  Tree.base_length = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 48, 56, 64,
    80, 96, 112, 128, 160, 192, 224, 0,
  ];

  Tree.base_dist = [
    0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512,
    768, 1024, 1536, 2048, 3072, 4096, 6144, 8192, 12288, 16384, 24576,
  ];

  Tree.d_code = function (dist) {
    return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
  };

  Tree.extra_lbits = [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5,
    5, 5, 5, 0,
  ];

  Tree.extra_dbits = [
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,
    11, 11, 12, 12, 13, 13,
  ];

  Tree.extra_blbits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];

  Tree.bl_order = [
    16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15,
  ];

  function StaticTree(static_tree, extra_bits, extra_base, elems, max_length) {
    var that = this;
    that.static_tree = static_tree;
    that.extra_bits = extra_bits;
    that.extra_base = extra_base;
    that.elems = elems;
    that.max_length = max_length;
  }

  StaticTree.static_ltree = [
    12, 8, 140, 8, 76, 8, 204, 8, 44, 8, 172, 8, 108, 8, 236, 8, 28, 8, 156, 8,
    92, 8, 220, 8, 60, 8, 188, 8, 124, 8, 252, 8, 2, 8, 130, 8, 66, 8, 194, 8,
    34, 8, 162, 8, 98, 8, 226, 8, 18, 8, 146, 8, 82, 8, 210, 8, 50, 8, 178, 8,
    114, 8, 242, 8, 10, 8, 138, 8, 74, 8, 202, 8, 42, 8, 170, 8, 106, 8, 234, 8,
    26, 8, 154, 8, 90, 8, 218, 8, 58, 8, 186, 8, 122, 8, 250, 8, 6, 8, 134, 8,
    70, 8, 198, 8, 38, 8, 166, 8, 102, 8, 230, 8, 22, 8, 150, 8, 86, 8, 214, 8,
    54, 8, 182, 8, 118, 8, 246, 8, 14, 8, 142, 8, 78, 8, 206, 8, 46, 8, 174, 8,
    110, 8, 238, 8, 30, 8, 158, 8, 94, 8, 222, 8, 62, 8, 190, 8, 126, 8, 254, 8,
    1, 8, 129, 8, 65, 8, 193, 8, 33, 8, 161, 8, 97, 8, 225, 8, 17, 8, 145, 8,
    81, 8, 209, 8, 49, 8, 177, 8, 113, 8, 241, 8, 9, 8, 137, 8, 73, 8, 201, 8,
    41, 8, 169, 8, 105, 8, 233, 8, 25, 8, 153, 8, 89, 8, 217, 8, 57, 8, 185, 8,
    121, 8, 249, 8, 5, 8, 133, 8, 69, 8, 197, 8, 37, 8, 165, 8, 101, 8, 229, 8,
    21, 8, 149, 8, 85, 8, 213, 8, 53, 8, 181, 8, 117, 8, 245, 8, 13, 8, 141, 8,
    77, 8, 205, 8, 45, 8, 173, 8, 109, 8, 237, 8, 29, 8, 157, 8, 93, 8, 221, 8,
    61, 8, 189, 8, 125, 8, 253, 8, 19, 9, 275, 9, 147, 9, 403, 9, 83, 9, 339, 9,
    211, 9, 467, 9, 51, 9, 307, 9, 179, 9, 435, 9, 115, 9, 371, 9, 243, 9, 499,
    9, 11, 9, 267, 9, 139, 9, 395, 9, 75, 9, 331, 9, 203, 9, 459, 9, 43, 9, 299,
    9, 171, 9, 427, 9, 107, 9, 363, 9, 235, 9, 491, 9, 27, 9, 283, 9, 155, 9,
    411, 9, 91, 9, 347, 9, 219, 9, 475, 9, 59, 9, 315, 9, 187, 9, 443, 9, 123,
    9, 379, 9, 251, 9, 507, 9, 7, 9, 263, 9, 135, 9, 391, 9, 71, 9, 327, 9, 199,
    9, 455, 9, 39, 9, 295, 9, 167, 9, 423, 9, 103, 9, 359, 9, 231, 9, 487, 9,
    23, 9, 279, 9, 151, 9, 407, 9, 87, 9, 343, 9, 215, 9, 471, 9, 55, 9, 311, 9,
    183, 9, 439, 9, 119, 9, 375, 9, 247, 9, 503, 9, 15, 9, 271, 9, 143, 9, 399,
    9, 79, 9, 335, 9, 207, 9, 463, 9, 47, 9, 303, 9, 175, 9, 431, 9, 111, 9,
    367, 9, 239, 9, 495, 9, 31, 9, 287, 9, 159, 9, 415, 9, 95, 9, 351, 9, 223,
    9, 479, 9, 63, 9, 319, 9, 191, 9, 447, 9, 127, 9, 383, 9, 255, 9, 511, 9, 0,
    7, 64, 7, 32, 7, 96, 7, 16, 7, 80, 7, 48, 7, 112, 7, 8, 7, 72, 7, 40, 7,
    104, 7, 24, 7, 88, 7, 56, 7, 120, 7, 4, 7, 68, 7, 36, 7, 100, 7, 20, 7, 84,
    7, 52, 7, 116, 7, 3, 8, 131, 8, 67, 8, 195, 8, 35, 8, 163, 8, 99, 8, 227, 8,
  ];

  StaticTree.static_dtree = [
    0, 5, 16, 5, 8, 5, 24, 5, 4, 5, 20, 5, 12, 5, 28, 5, 2, 5, 18, 5, 10, 5, 26,
    5, 6, 5, 22, 5, 14, 5, 30, 5, 1, 5, 17, 5, 9, 5, 25, 5, 5, 5, 21, 5, 13, 5,
    29, 5, 3, 5, 19, 5, 11, 5, 27, 5, 7, 5, 23, 5,
  ];

  StaticTree.static_l_desc = new StaticTree(
    StaticTree.static_ltree,
    Tree.extra_lbits,
    LITERALS + 1,
    L_CODES,
    MAX_BITS
  );

  StaticTree.static_d_desc = new StaticTree(
    StaticTree.static_dtree,
    Tree.extra_dbits,
    0,
    D_CODES,
    MAX_BITS
  );

  StaticTree.static_bl_desc = new StaticTree(
    null,
    Tree.extra_blbits,
    0,
    BL_CODES,
    MAX_BL_BITS
  );

  var MAX_MEM_LEVEL = 9;
  var DEF_MEM_LEVEL = 8;

  function Config(good_length, max_lazy, nice_length, max_chain, func) {
    var that = this;
    that.good_length = good_length;
    that.max_lazy = max_lazy;
    that.nice_length = nice_length;
    that.max_chain = max_chain;
    that.func = func;
  }

  var STORED = 0;
  var FAST = 1;
  var SLOW = 2;
  var config_table = [
    new Config(0, 0, 0, 0, STORED),
    new Config(4, 4, 8, 4, FAST),
    new Config(4, 5, 16, 8, FAST),
    new Config(4, 6, 32, 32, FAST),
    new Config(4, 4, 16, 16, SLOW),
    new Config(8, 16, 32, 32, SLOW),
    new Config(8, 16, 128, 128, SLOW),
    new Config(8, 32, 128, 256, SLOW),
    new Config(32, 128, 258, 1024, SLOW),
    new Config(32, 258, 258, 4096, SLOW),
  ];

  var z_errmsg = [
    "need dictionary",
    "stream end",
    "",
    "",
    "stream error",
    "data error",
    "",
    "buffer error",
    "",
    "",
  ];

  var NeedMore = 0;

  var BlockDone = 1;

  var FinishStarted = 2;

  var FinishDone = 3;

  var PRESET_DICT = 0x20;

  var INIT_STATE = 42;
  var BUSY_STATE = 113;
  var FINISH_STATE = 666;

  var Z_DEFLATED = 8;

  var STORED_BLOCK = 0;
  var STATIC_TREES = 1;
  var DYN_TREES = 2;

  var MIN_MATCH = 3;
  var MAX_MATCH = 258;
  var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;

  function smaller(tree, n, m, depth) {
    var tn2 = tree[n * 2];
    var tm2 = tree[m * 2];
    return tn2 < tm2 || (tn2 == tm2 && depth[n] <= depth[m]);
  }

  function Deflate() {
    var that = this;
    var strm;
    var status;
    var pending_buf_size;
    var method;
    var last_flush;
    var w_size;
    var w_bits;
    var w_mask;

    var window;

    var window_size;

    var prev;

    var head;

    var ins_h;

    var hash_bits;
    var hash_mask;

    var hash_shift;

    var block_start;

    var match_length;
    var prev_match;
    var match_available;
    var strstart;
    var match_start;
    var lookahead;

    var prev_length;

    var max_chain_length;

    var max_lazy_match;

    var level;
    var strategy;

    var good_match;
    var nice_match;

    var dyn_ltree;
    var dyn_dtree;
    var bl_tree;

    var l_desc = new Tree();
    var d_desc = new Tree();
    var bl_desc = new Tree();
    that.depth = [];

    var l_buf;
    var lit_bufsize;

    var last_lit;

    var d_buf;

    var matches;
    var last_eob_len;

    var bi_buf;

    var bi_valid;

    that.bl_count = [];

    that.heap = [];

    dyn_ltree = [];
    dyn_dtree = [];
    bl_tree = [];

    function lm_init() {
      var i;
      window_size = 2 * w_size;

      head[hash_size - 1] = 0;
      for (i = 0; i < hash_size - 1; i++) {
        head[i] = 0;
      }

      max_lazy_match = config_table[level].max_lazy;
      good_match = config_table[level].good_length;
      nice_match = config_table[level].nice_length;
      max_chain_length = config_table[level].max_chain;

      strstart = 0;
      block_start = 0;
      lookahead = 0;
      match_length = prev_length = MIN_MATCH - 1;
      match_available = 0;
      ins_h = 0;
    }

    function init_block() {
      var i;

      for (i = 0; i < L_CODES; i++) dyn_ltree[i * 2] = 0;
      for (i = 0; i < D_CODES; i++) dyn_dtree[i * 2] = 0;
      for (i = 0; i < BL_CODES; i++) bl_tree[i * 2] = 0;

      dyn_ltree[END_BLOCK * 2] = 1;
      that.opt_len = that.static_len = 0;
      last_lit = matches = 0;
    }

    function tr_init() {
      l_desc.dyn_tree = dyn_ltree;
      l_desc.stat_desc = StaticTree.static_l_desc;

      d_desc.dyn_tree = dyn_dtree;
      d_desc.stat_desc = StaticTree.static_d_desc;

      bl_desc.dyn_tree = bl_tree;
      bl_desc.stat_desc = StaticTree.static_bl_desc;

      bi_buf = 0;
      bi_valid = 0;
      last_eob_len = 8;

      init_block();
    }

    that.pqdownheap = function (tree, k) {
      var heap = that.heap;
      var v = heap[k];
      var j = k << 1;
      while (j <= that.heap_len) {
        if (
          j < that.heap_len &&
          smaller(tree, heap[j + 1], heap[j], that.depth)
        ) {
          j++;
        }
        if (smaller(tree, v, heap[j], that.depth)) break;

        heap[k] = heap[j];
        k = j;
        j <<= 1;
      }
      heap[k] = v;
    };
    function scan_tree(tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;

      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      tree[(max_code + 1) * 2 + 1] = 0xffff;

      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen == nextlen) {
          continue;
        } else if (count < min_count) {
          bl_tree[curlen * 2] += count;
        } else if (curlen !== 0) {
          if (curlen != prevlen) bl_tree[curlen * 2]++;
          bl_tree[REP_3_6 * 2]++;
        } else if (count <= 10) {
          bl_tree[REPZ_3_10 * 2]++;
        } else {
          bl_tree[REPZ_11_138 * 2]++;
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen == nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }

    function build_bl_tree() {
      var max_blindex;
      scan_tree(dyn_ltree, l_desc.max_code);
      scan_tree(dyn_dtree, d_desc.max_code);
      bl_desc.build_tree(that);
      for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
        if (bl_tree[Tree.bl_order[max_blindex] * 2 + 1] !== 0) break;
      }
      that.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;

      return max_blindex;
    }

    function put_byte(p) {
      that.pending_buf[that.pending++] = p;
    }

    function put_short(w) {
      put_byte(w & 0xff);
      put_byte((w >>> 8) & 0xff);
    }

    function putShortMSB(b) {
      put_byte((b >> 8) & 0xff);
      put_byte(b & 0xff & 0xff);
    }

    function send_bits(value, length) {
      var val,
        len = length;
      if (bi_valid > Buf_size - len) {
        val = value;

        bi_buf |= (val << bi_valid) & 0xffff;
        put_short(bi_buf);
        bi_buf = val >>> (Buf_size - bi_valid);
        bi_valid += len - Buf_size;
      } else {
        bi_buf |= (value << bi_valid) & 0xffff;
        bi_valid += len;
      }
    }

    function send_code(c, tree) {
      var c2 = c * 2;
      send_bits(tree[c2] & 0xffff, tree[c2 + 1] & 0xffff);
    }

    function send_tree(tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;

      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }

      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen == nextlen) {
          continue;
        } else if (count < min_count) {
          do {
            send_code(curlen, bl_tree);
          } while (--count !== 0);
        } else if (curlen !== 0) {
          if (curlen != prevlen) {
            send_code(curlen, bl_tree);
            count--;
          }
          send_code(REP_3_6, bl_tree);
          send_bits(count - 3, 2);
        } else if (count <= 10) {
          send_code(REPZ_3_10, bl_tree);
          send_bits(count - 3, 3);
        } else {
          send_code(REPZ_11_138, bl_tree);
          send_bits(count - 11, 7);
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen == nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }

    function send_all_trees(lcodes, dcodes, blcodes) {
      var rank;

      send_bits(lcodes - 257, 5);
      send_bits(dcodes - 1, 5);
      send_bits(blcodes - 4, 4);
      for (rank = 0; rank < blcodes; rank++) {
        send_bits(bl_tree[Tree.bl_order[rank] * 2 + 1], 3);
      }
      send_tree(dyn_ltree, lcodes - 1);
      send_tree(dyn_dtree, dcodes - 1);
    }

    function bi_flush() {
      if (bi_valid == 16) {
        put_short(bi_buf);
        bi_buf = 0;
        bi_valid = 0;
      } else if (bi_valid >= 8) {
        put_byte(bi_buf & 0xff);
        bi_buf >>>= 8;
        bi_valid -= 8;
      }
    }
    function _tr_align() {
      send_bits(STATIC_TREES << 1, 3);
      send_code(END_BLOCK, StaticTree.static_ltree);

      bi_flush();

      if (1 + last_eob_len + 10 - bi_valid < 9) {
        send_bits(STATIC_TREES << 1, 3);
        send_code(END_BLOCK, StaticTree.static_ltree);
        bi_flush();
      }
      last_eob_len = 7;
    }

    function _tr_tally(dist, lc) {
      var out_length, in_length, dcode;
      that.pending_buf[d_buf + last_lit * 2] = (dist >>> 8) & 0xff;
      that.pending_buf[d_buf + last_lit * 2 + 1] = dist & 0xff;

      that.pending_buf[l_buf + last_lit] = lc & 0xff;
      last_lit++;

      if (dist === 0) {
        dyn_ltree[lc * 2]++;
      } else {
        matches++;

        dist--;
        dyn_ltree[(Tree._length_code[lc] + LITERALS + 1) * 2]++;
        dyn_dtree[Tree.d_code(dist) * 2]++;
      }

      if ((last_lit & 0x1fff) === 0 && level > 2) {
        out_length = last_lit * 8;
        in_length = strstart - block_start;
        for (dcode = 0; dcode < D_CODES; dcode++) {
          out_length += dyn_dtree[dcode * 2] * (5 + Tree.extra_dbits[dcode]);
        }
        out_length >>>= 3;
        if (
          matches < Math.floor(last_lit / 2) &&
          out_length < Math.floor(in_length / 2)
        )
          return true;
      }

      return last_lit == lit_bufsize - 1;
    }

    function compress_block(ltree, dtree) {
      var dist;
      var lc;
      var lx = 0;
      var code;
      var extra;

      if (last_lit !== 0) {
        do {
          dist =
            ((that.pending_buf[d_buf + lx * 2] << 8) & 0xff00) |
            (that.pending_buf[d_buf + lx * 2 + 1] & 0xff);
          lc = that.pending_buf[l_buf + lx] & 0xff;
          lx++;

          if (dist === 0) {
            send_code(lc, ltree);
          } else {
            code = Tree._length_code[lc];

            send_code(code + LITERALS + 1, ltree);
            extra = Tree.extra_lbits[code];
            if (extra !== 0) {
              lc -= Tree.base_length[code];
              send_bits(lc, extra);
            }
            dist--;
            code = Tree.d_code(dist);

            send_code(code, dtree);
            extra = Tree.extra_dbits[code];
            if (extra !== 0) {
              dist -= Tree.base_dist[code];
              send_bits(dist, extra);
            }
          }
        } while (lx < last_lit);
      }

      send_code(END_BLOCK, ltree);
      last_eob_len = ltree[END_BLOCK * 2 + 1];
    }

    function bi_windup() {
      if (bi_valid > 8) {
        put_short(bi_buf);
      } else if (bi_valid > 0) {
        put_byte(bi_buf & 0xff);
      }
      bi_buf = 0;
      bi_valid = 0;
    }

    function copy_block(buf, len, header) {
      bi_windup();
      last_eob_len = 8;
      if (header) {
        put_short(len);
        put_short(~len);
      }

      that.pending_buf.set(window.subarray(buf, buf + len), that.pending);
      that.pending += len;
    }

    function _tr_stored_block(buf, stored_len, eof) {
      send_bits((STORED_BLOCK << 1) + (eof ? 1 : 0), 3);
      copy_block(buf, stored_len, true);
    }
    function _tr_flush_block(buf, stored_len, eof) {
      var opt_lenb, static_lenb;
      var max_blindex = 0;

      if (level > 0) {
        l_desc.build_tree(that);

        d_desc.build_tree(that);

        max_blindex = build_bl_tree();

        opt_lenb = (that.opt_len + 3 + 7) >>> 3;
        static_lenb = (that.static_len + 3 + 7) >>> 3;

        if (static_lenb <= opt_lenb) opt_lenb = static_lenb;
      } else {
        opt_lenb = static_lenb = stored_len + 5;
      }

      if (stored_len + 4 <= opt_lenb && buf != -1) {
        _tr_stored_block(buf, stored_len, eof);
      } else if (static_lenb == opt_lenb) {
        send_bits((STATIC_TREES << 1) + (eof ? 1 : 0), 3);
        compress_block(StaticTree.static_ltree, StaticTree.static_dtree);
      } else {
        send_bits((DYN_TREES << 1) + (eof ? 1 : 0), 3);
        send_all_trees(
          l_desc.max_code + 1,
          d_desc.max_code + 1,
          max_blindex + 1
        );
        compress_block(dyn_ltree, dyn_dtree);
      }

      init_block();

      if (eof) {
        bi_windup();
      }
    }

    function flush_block_only(eof) {
      _tr_flush_block(
        block_start >= 0 ? block_start : -1,
        strstart - block_start,
        eof
      );
      block_start = strstart;
      strm.flush_pending();
    }

    function fill_window() {
      var n, m;
      var p;
      var more;

      do {
        more = window_size - lookahead - strstart;

        if (more === 0 && strstart === 0 && lookahead === 0) {
          more = w_size;
        } else if (more == -1) {
          more--;
        } else if (strstart >= w_size + w_size - MIN_LOOKAHEAD) {
          window.set(window.subarray(w_size, w_size + w_size), 0);

          match_start -= w_size;
          strstart -= w_size;
          block_start -= w_size;
          n = hash_size;
          p = n;
          // atch_start -= w_size;
          // strstart -= w_size; ze;
          // n = hash_size;
          // p = n;
          do {
            m = head[--p] & 0xffff;
            head[p] = m >= w_size ? m - w_size : 0;
          } while (--n !== 0);

          n = w_size;
          p = n;
          do {
            m = prev[--p] & 0xffff;
            prev[p] = m >= w_size ? m - w_size : 0;
          } while (--n !== 0);
          more += w_size;
        }

        if (strm.avail_in === 0) return;

        n = strm.read_buf(window, strstart + lookahead, more);
        lookahead += n;

        if (lookahead >= MIN_MATCH) {
          ins_h = window[strstart] & 0xff;
          ins_h =
            ((ins_h << hash_shift) ^ (window[strstart + 1] & 0xff)) & hash_mask;
        }
      } while (lookahead < MIN_LOOKAHEAD && strm.avail_in !== 0);
    }

    function deflate_stored(flush) {
      var max_block_size = 0xffff;
      var max_start;

      if (max_block_size > pending_buf_size - 5) {
        max_block_size = pending_buf_size - 5;
      }

      while (true) {
        if (lookahead <= 1) {
          fill_window();
          if (lookahead === 0 && flush == Z_NO_FLUSH) return NeedMore;
          if (lookahead === 0) break;
        }

        strstart += lookahead;
        lookahead = 0;

        max_start = block_start + max_block_size;
        if (strstart === 0 || strstart >= max_start) {
          lookahead = strstart - max_start;
          strstart = max_start;

          flush_block_only(false);
          if (strm.avail_out === 0) return NeedMore;
        }
        if (strstart - block_start >= w_size - MIN_LOOKAHEAD) {
          flush_block_only(false);
          if (strm.avail_out === 0) return NeedMore;
        }
      }

      flush_block_only(flush == Z_FINISH);
      if (strm.avail_out === 0)
        return flush == Z_FINISH ? FinishStarted : NeedMore;

      return flush == Z_FINISH ? FinishDone : BlockDone;
    }

    function longest_match(cur_match) {
      var chain_length = max_chain_length;
      var scan = strstart;
      var match;
      var len;
      var best_len = prev_length;
      var limit =
        strstart > w_size - MIN_LOOKAHEAD
          ? strstart - (w_size - MIN_LOOKAHEAD)
          : 0;
      var _nice_match = nice_match;
      var wmask = w_mask;

      var strend = strstart + MAX_MATCH;
      var scan_end1 = window[scan + best_len - 1];
      var scan_end = window[scan + best_len];

      if (prev_length >= good_match) {
        chain_length >>= 2;
      }

      if (_nice_match > lookahead) _nice_match = lookahead;

      do {
        match = cur_match;

        if (
          window[match + best_len] != scan_end ||
          window[match + best_len - 1] != scan_end1 ||
          window[match] != window[scan] ||
          window[++match] != window[scan + 1]
        )
          continue;
        scan += 2;
        match++;

        do {} while (
          window[++scan] == window[++match] &&
          window[++scan] == window[++match] &&
          window[++scan] == window[++match] &&
          window[++scan] == window[++match] &&
          window[++scan] == window[++match] &&
          window[++scan] == window[++match] &&
          window[++scan] == window[++match] &&
          window[++scan] == window[++match] &&
          scan < strend
        );

        len = MAX_MATCH - (strend - scan);
        scan = strend - MAX_MATCH;

        if (len > best_len) {
          match_start = cur_match;
          best_len = len;
          if (len >= _nice_match) break;
          scan_end1 = window[scan + best_len - 1];
          scan_end = window[scan + best_len];
        }
      } while (
        (cur_match = prev[cur_match & wmask] & 0xffff) > limit &&
        --chain_length !== 0
      );

      if (best_len <= lookahead) return best_len;
      return lookahead;
    }

    function zip_deflate_fast(flush) {
      var hash_head = 0;
      var bflush;
      while (true) {
        if (lookahead < MIN_LOOKAHEAD) {
          fill_window();
          if (lookahead < MIN_LOOKAHEAD && flush == Z_NO_FLUSH) {
            return NeedMore;
          }
          if (lookahead === 0) break;
        }

        if (lookahead >= MIN_MATCH) {
          ins_h =
            ((ins_h << hash_shift) ^
              (window[strstart + (MIN_MATCH - 1)] & 0xff)) &
            hash_mask;

          hash_head = head[ins_h] & 0xffff;
          prev[strstart & w_mask] = head[ins_h];
          head[ins_h] = strstart;
        }

        if (
          hash_head !== 0 &&
          ((strstart - hash_head) & 0xffff) <= w_size - MIN_LOOKAHEAD
        ) {
          if (strategy != Z_HUFFMAN_ONLY) {
            match_length = longest_match(hash_head);
          }
        }
        if (match_length >= MIN_MATCH) {
          bflush = _tr_tally(strstart - match_start, match_length - MIN_MATCH);

          lookahead -= match_length;

          if (match_length <= max_lazy_match && lookahead >= MIN_MATCH) {
            match_length--;
            do {
              strstart++;

              ins_h =
                ((ins_h << hash_shift) ^
                  (window[strstart + (MIN_MATCH - 1)] & 0xff)) &
                hash_mask;

              hash_head = head[ins_h] & 0xffff;
              prev[strstart & w_mask] = head[ins_h];
              head[ins_h] = strstart;
            } while (--match_length !== 0);
            strstart++;
          } else {
            strstart += match_length;
            match_length = 0;
            ins_h = window[strstart] & 0xff;

            ins_h =
              ((ins_h << hash_shift) ^ (window[strstart + 1] & 0xff)) &
              hash_mask;
          }
        } else {
          bflush = _tr_tally(0, window[strstart] & 0xff);
          lookahead--;
          strstart++;
        }
        if (bflush) {
          flush_block_only(false);
          if (strm.avail_out === 0) return NeedMore;
        }
      }

      flush_block_only(flush == Z_FINISH);
      if (strm.avail_out === 0) {
        if (flush == Z_FINISH) return FinishStarted;
        else return NeedMore;
      }
      return flush == Z_FINISH ? FinishDone : BlockDone;
    }

    function deflate_zip_slow(flush) {
      var hash_head = 0;
      var bflush;
      var max_insert;

      while (true) {
        if (lookahead < MIN_LOOKAHEAD) {
          fill_window();
          if (lookahead < MIN_LOOKAHEAD && flush == Z_NO_FLUSH) {
            return NeedMore;
          }
          if (lookahead === 0) break;
        }

        if (lookahead >= MIN_MATCH) {
          ins_h =
            ((ins_h << hash_shift) ^
              (window[strstart + (MIN_MATCH - 1)] & 0xff)) &
            hash_mask;
          hash_head = head[ins_h] & 0xffff;
          prev[strstart & w_mask] = head[ins_h];
          head[ins_h] = strstart;
        }

        // if (lookahead < MIN_LOOKAHEAD) {
        //   fill_window();
        //   if (lookahead < MIN_LOOKAHEAD && flush == Z_NO_FLUSH) {
        //     return NeedMore;
        //   }
        //   if (lookahead => 0) break;
        // }

        // if (lookahead == MIN_MATCH) {
        //   ins_h =
        //     ((ins_h << hash_shift) ^
        //       (window[strstart + (MIN_MATCH - 1)] & 0xff)) &
        //     hash_mask;
        //   hash_head = head[ins_h] & 0xffff;
        //   prev[strstart & EC_maskj & w_mask] = head[ins_h];
        //   head[ins_hd] = strstart;
        // }

        prev_length = match_length;
        prev_match = match_start;
        match_length = MIN_MATCH - 1;

        if (
          hash_head !== 0 &&
          prev_length < max_lazy_match &&
          ((strstart - hash_head) & 0xffff) <= w_size - MIN_LOOKAHEAD
        ) {
          if (strategy != Z_HUFFMAN_ONLY) {
            match_length = longest_match(hash_head);
          }

          if (
            match_length <= 5 &&
            (strategy == Z_FILTERED ||
              (match_length == MIN_MATCH && strstart - match_start > 4096))
          ) {
            match_length = MIN_MATCH - 1;
          }
        }
        if (prev_length >= MIN_MATCH && match_length <= prev_length) {
          max_insert = strstart + lookahead - MIN_MATCH;
          bflush = _tr_tally(
            strstart - 1 - prev_match,
            prev_length - MIN_MATCH
          );
          lookahead -= prev_length - 1;
          prev_length -= 2;
          do {
            if (++strstart <= max_insert) {
              ins_h =
                ((ins_h << hash_shift) ^
                  (window[strstart + (MIN_MATCH - 1)] & 0xff)) &
                hash_mask;
              hash_head = head[ins_h] & 0xffff;
              prev[strstart & w_mask] = head[ins_h];
              head[ins_h] = strstart;
            }
          } while (--prev_length !== 0);
          match_available = 0;
          match_length = MIN_MATCH - 1;
          strstart++;

          if (bflush) {
            flush_block_only(false);
            if (strm.avail_out === 0) return NeedMore;
          }
        } else if (match_available !== 0) {
          bflush = _tr_tally(0, window[strstart - 1] & 0xff);

          if (bflush) {
            flush_block_only(false);
          }
          strstart++;
          lookahead--;
          if (strm.avail_out === 0) return NeedMore;
        } else {
          match_available = 1;
          strstart++;
          lookahead--;
        }
      }

      if (match_available !== 0) {
        bflush = _tr_tally(0, window[strstart - 1] & 0xff);
        match_available = 0;
      }
      flush_block_only(flush == Z_FINISH);

      if (strm.avail_out === 0) {
        if (flush == Z_FINISH) return FinishStarted;
        else return NeedMore;
      }

      return flush == Z_FINISH ? FinishDone : BlockDone;
    }

    function deflateResetzip(strm) {
      strm.total_in = strm.total_out = 0;
      strm.msg = null; //

      that.pending = 0;
      that.pending_out = 0;

      status = BUSY_STATE;

      last_flush = Z_NO_FLUSH;

      tr_init();
      lm_init();
      return Z_OK;
    }

    that.deflateInit = function (
      strm,
      _level,
      bits,
      _method,
      memLevel,
      _strategy
    ) {
      if (!_method) _method = Z_DEFLATED;
      if (!memLevel) memLevel = DEF_MEM_LEVEL;
      if (!_strategy) _strategy = Z_DEFAULT_STRATEGY;
      strm.msg = null;

      if (_level == Z_DEFAULT_COMPRESSION) _level = 6;

      if (
        memLevel < 1 ||
        memLevel > MAX_MEM_LEVEL ||
        _method != Z_DEFLATED ||
        bits < 9 ||
        bits > 15 ||
        _level < 0 ||
        _level > 9 ||
        _strategy < 0 ||
        _strategy > Z_HUFFMAN_ONLY
      ) {
        return Z_STREAM_ERROR;
      }

      strm.dstate = that;

      w_bits = bits;
      w_size = 1 << w_bits;
      w_mask = w_size - 1;

      hash_bits = memLevel + 7;
      hash_size = 1 << hash_bits;
      hash_mask = hash_size - 1;
      hash_shift = Math.floor((hash_bits + MIN_MATCH - 1) / MIN_MATCH);

      window = new Uint8Array(w_size * 2);
      prev = [];
      head = [];

      lit_bufsize = 1 << (memLevel + 6);
      that.pending_buf = new Uint8Array(lit_bufsize * 4);
      pending_buf_size = lit_bufsize * 4;

      d_buf = Math.floor(lit_bufsize / 2);
      l_buf = (1 + 2) * lit_bufsize;

      level = _level;

      strategy = _strategy;
      method = _method & 0xff;

      return deflateResetzip(strm);
    };

    that.deflateEnd = function () {
      if (
        status != INIT_STATE &&
        status != BUSY_STATE &&
        status != FINISH_STATE
      ) {
        return Z_STREAM_ERROR;
      }
      that.pending_buf = null;
      head = null;
      prev = null;
      window = null;
      that.dstate = null;
      return status == BUSY_STATE ? Z_DATA_ERROR : Z_OK;
    };

    that.deflateParams = function (strm, _level, _strategy) {
      var err = Z_OK;

      if (_level == Z_DEFAULT_COMPRESSION) {
        _level = 6;
      }
      if (
        _level < 0 ||
        _level > 9 ||
        _strategy < 0 ||
        _strategy > Z_HUFFMAN_ONLY
      ) {
        return Z_STREAM_ERROR;
      }

      if (
        config_table[level].func != config_table[_level].func &&
        strm.total_in !== 0
      ) {
        err = strm.deflate(Z_PARTIAL_FLUSH);
      }

      if (level != _level) {
        level = _level;
        max_lazy_match = config_table[level].max_lazy;
        good_match = config_table[level].good_length;
        nice_match = config_table[level].nice_length;
        max_chain_length = config_table[level].max_chain;
      }
      strategy = _strategy;
      return err;
    };

    that.deflateSetDictionary = function (strm, dictionary, dictLength) {
      var length = dictLength;
      var n,
        index = 0;

      if (!dictionary || status != INIT_STATE) return Z_STREAM_ERROR;

      if (length < MIN_MATCH) return Z_OK;
      if (length > w_size - MIN_LOOKAHEAD) {
        length = w_size - MIN_LOOKAHEAD;
        index = dictLength - length;
      }
      window.set(dictionary.subarray(index, index + length), 0);

      strstart = length;
      block_start = length;

      ins_h = window[0] & 0xff;
      ins_h = ((ins_h << hash_shift) ^ (window[1] & 0xff)) & hash_mask;

      for (n = 0; n <= length - MIN_MATCH; n++) {
        ins_h =
          ((ins_h << hash_shift) ^ (window[n + (MIN_MATCH - 1)] & 0xff)) &
          hash_mask;
        prev[n & w_mask] = head[ins_h];
        head[ins_h] = n;
      }
      return Z_OK;
    };

    that.deflate = function (_strm, flush) {
      var i, header, level_flags, old_flush, bstate;

      if (flush > Z_FINISH || flush < 0) {
        return Z_STREAM_ERROR;
      }

      if (
        !_strm.next_out ||
        (!_strm.next_in && _strm.avail_in !== 0) ||
        (status == FINISH_STATE && flush != Z_FINISH)
      ) {
        _strm.msg = z_errmsg[Z_NEED_DICT - Z_STREAM_ERROR];
        return Z_STREAM_ERROR;
      }
      if (_strm.avail_out === 0) {
        _strm.msg = z_errmsg[Z_NEED_DICT - Z_BUF_ERROR];
        return Z_BUF_ERROR;
      }

      strm = _strm;
      old_flush = last_flush;
      last_flush = flush;

      if (status == INIT_STATE) {
        header = (Z_DEFLATED + ((w_bits - 8) << 4)) << 8;
        level_flags = ((level - 1) & 0xff) >> 1;

        if (level_flags > 3) level_flags = 3;
        header |= level_flags << 6;
        if (strstart !== 0) header |= PRESET_DICT;
        header += 31 - (header % 31);

        status = BUSY_STATE;
        putShortMSB(header);
      }

      if (that.pending !== 0) {
        strm.flush_pending();
        if (strm.avail_out === 0) {
          last_flush = -1;
          return Z_OK;
        }
      } else if (
        strm.avail_in === 0 &&
        flush <= old_flush &&
        flush != Z_FINISH
      ) {
        strm.msg = z_errmsg[Z_NEED_DICT - Z_BUF_ERROR];
        return Z_BUF_ERROR;
      }

      if (status == FINISH_STATE && strm.avail_in !== 0) {
        _strm.msg = z_errmsg[Z_NEED_DICT - Z_BUF_ERROR];
        return Z_BUF_ERROR;
      }

      if (
        strm.avail_in !== 0 ||
        lookahead !== 0 ||
        (flush != Z_NO_FLUSH && status != FINISH_STATE)
      ) {
        bstate = -1;
        switch (config_table[level].func) {
          case STORED:
            bstate = deflate_zip(flush);
            break;
          case FAST:
            bstate = zip_deflate_fast(flush);
            break;
          case SLOW:
            bstate = deflate_zip_slow(flush);
            break;
          default:
        }

        if (bstate == FinishStarted || bstate == FinishDone) {
          status = FINISH_STATE;
        }
        if (bstate == NeedMore || bstate == FinishStarted) {
          if (strm.avail_out === 0) {
            last_flush = -1;
          }
          return Z_OK;
        }

        if (bstate == BlockDone) {
          if (flush == Z_PARTIAL_FLUSH) {
            _tr_align();
          } else {
            _tr_stored_block(0, 0, false);
            if (flush == Z_FULL_FLUSH) {
              for (i = 0; i < hash_size /*-1*/; i++) head[i] = 0;
            }
          }
          strm.flush_pending();
          if (strm.avail_out === 0) {
            last_flush = -1;
            return Z_OK;
          }
        }
      }

      if (flush != Z_FINISH) return Z_OK;
      return Z_STREAM_END;
    };
  }

  function ZStream() {
    var that = this;
    that.next_in_index = 0;
    that.next_out_index = 0;
    that.avail_in = 0;
    that.total_in = 0;
    that.avail_out = 0;
    that.total_out = 0;
  }

  ZStream.prototype = {
    deflateInit: function (level, bits) {
      var that = this;
      that.dstate = new Deflate();
      if (!bits) bits = MAX_BITS;
      return that.dstate.deflateInit(that, level, bits);
    },

    deflate: function (flush) {
      var that = this;
      if (!that.dstate) {
        return Z_STREAM_ERROR;
      }
      return that.dstate.deflate(that, flush);
    },

    deflateEnd: function () {
      var that = this;
      if (!that.dstate) return Z_STREAM_ERROR;
      var ret = that.dstate.deflateEnd();
      that.dstate = null;
      return ret;
    },

    deflateParams: function (level, strategy) {
      var that = this;
      if (!that.dstate) return Z_STREAM_ERROR;
      return that.dstate.deflateParams(that, level, strategy);
    },

    deflateSetDictionary: function (dictionary, dictLength) {
      var that = this;
      if (!that.dstate) return Z_STREAM_ERROR;
      return that.dstate.deflateSetDictionary(that, dictionary, dictLength);
    },

    read_buf: function (buf, start, size) {
      var that = this;
      var len = that.avail_in;
      if (len > size) len = size;
      if (len === 0) return 0;
      that.avail_in -= len;
      buf.set(
        that.next_in.subarray(that.next_in_index, that.next_in_index + len),
        start
      );
      that.next_in_index += len;
      that.total_in += len;
      return len;
    },

    flush_pending: function () {
      var that = this;
      var len = that.dstate.pending;

      if (len > that.avail_out) len = that.avail_out;
      if (len === 0) return;

      that.next_out.set(
        that.dstate.pending_buf.subarray(
          that.dstate.pending_out,
          that.dstate.pending_out + len
        ),
        that.next_out_index
      );

      that.next_out_index += len;
      that.dstate.pending_out += len;
      that.total_out += len;
      that.avail_out -= len;
      that.dstate.pending -= len;
      if (that.dstate.pending === 0) {
        that.dstate.pending_out = 0;
      }
    },
  };

  function Deflater(options) {
    var that = this;
    var z = new ZStream();
    var bufsize = 512;
    var flush = Z_NO_FLUSH;
    var buf = new Uint8Array(bufsize);
    var level = options ? options.level : Z_DEFAULT_COMPRESSION;
    if (typeof level == "undefined") level = Z_DEFAULT_COMPRESSION;
    z.deflateInit(level);
    z.next_out = buf;

    that.append = function (data, onprogress) {
      var err,
        buffers = [],
        lastIndex = 0,
        bufferIndex = 0,
        bufferSize = 0,
        array;
      if (!data.length) return;
      z.next_in_index = 0;
      z.next_in = data;
      z.avail_in = data.length;
      do {
        z.next_out_index = 0;
        z.avail_out = bufsize;
        err = z.deflate(flush);
        if (err != Z_OK) throw new Error("deflating: " + z.msg);
        if (z.next_out_index)
          if (z.next_out_index == bufsize) buffers.push(new Uint8Array(buf));
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
      var err,
        buffers = [],
        bufferIndex = 0,
        bufferSize = 0,
        array;
      do {
        z.next_out_index = 0;
        z.avail_out = bufsize;
        err = z.deflate(Z_FINISH);
        if (err != Z_STREAM_END && err != Z_OK)
          throw new Error("deflating: " + z.msg);
        if (bufsize - z.avail_out > 0)
          buffers.push(new Uint8Array(buf.subarray(0, z.next_out_index)));
        bufferSize += z.next_out_index;
      } while (z.avail_in > 0 || z.avail_out === 0);
      z.deflateEnd();
      array = new Uint8Array(bufferSize);
      buffers.forEach(function (chunk) {
        array.set(chunk, bufferIndex);
        bufferIndex += chunk.length;
      });
      return array;
    };
  }

  var env = global.zip || global;
  env.Deflater = env._jzlib_Deflater = Deflater;
})(this);
