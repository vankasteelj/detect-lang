# detect-lang

**Node.js module: input text, get language it's written in. It's that simple. **

Based on Thenable Promises and thus working asynchronously, this module uses retext to analyse files & strings using Node.js

------

## Quick start

    npm install detect-lang

then:

```js
var detect = require('detect-lang');
var input = "Quand tu sauras mon crime, et le sort qui m'accable, je n'en mourrai pas moins, j'en mourrai plus coupable." // Phèdre, Racine, I-3.

detect(input)
    .then(function(data) {
        console.log(data);
    });
```

Output:

```js
Object {
    iso6391: 'fr',
    iso6392: null,
    terminologic: 'fra',
    bibliographic: 'fre',
    name: 'French',
    probability: '100.00',
    detected_langs: {
        fra: 1
    }
}
```

*ISO-639 is a pretty common standard. However, for best results, the output of 'iso6392' can be `null` when there are terminologic and bibliographic variants. Read the explaination of the ISO-639-2 on Wikipedia if you're confused.*

------

## License

This code is registered under GPLv3 - Copyright (c) 2015  Jean van Kasteel

### The GNU GENERAL PUBLIC LICENSE (GPL)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see http://www.gnu.org/licenses/