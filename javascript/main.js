var wordList;
var guessList;
var gl;
var w;
let tries;

var submitCharGlobal;
var submitGuessGlobal;
var removeCharGlobal;

const charState = {
    notInWord: 0,
    inWord: 1,
    correct: 2,
    submitted: 3
};


getWords().then(res => {

    guessList = res[0];
    wordList  = res[1];

    let wordLength = 5;
    let triesAmount = 6;
    let won = false;
    
    let queryParams = new URLSearchParams(location.search);
    
    let word = decodeWord(queryParams.get('w'));

    w = word;
    
    tries = [];
    
    let tryCursor = 0;
    let charCursor = 0;
    
    
    
    for (let i = 0; i < triesAmount; i++) {
        tries.push(new Array(wordLength));
    }
    
    renderGuessList();
    

    window.onkeydown = event => {
        
        if (won) {
            return;
        }
    
        if (event.key == 'Backspace') {
            removeChar();
            return;
        }
    
        if (event.key == 'Enter') {
            submitGuess();
            return;
        }
    
        let value = event.key.toUpperCase();
    
        if (!value.match(/^[A-Z]$/)) {
            return;
        }
    
        submitChar(value);
    
    };
    
    function removeChar() {
    
        if (charCursor > 0) {
            charCursor--;
        }
    
        tries[tryCursor][charCursor].char = '';
    
        updateActiveGuess();
    
    }

    removeCharGlobal = removeChar;
    
    function submitGuess() {
    
        if (charCursor != wordLength) {
            messageToast("Complete your guess first!");
            return;
        }


        if (checkGuess()) {
            tryCursor++;
            charCursor = 0;
        }
    
    
    }

    submitGuessGlobal = submitGuess;
    
    function checkGuess() {
        
        let guessAsWord = '';
        let checkWordInList = true;

        let actTry = tries[tryCursor];

        actTry.forEach(el => {
            if (el) {
                guessAsWord += el.char;
            } else {
                checkWordInList = false;
            }
        });

        if (checkWordInList) {
            if (!guessList.includes(guessAsWord)) {
                messageToast(`Sorry, "${guessAsWord}" is not in our database\nTry another one!`);
                return;
            }
        }

        let actTryWord = '';
        let notReady = false;
    
        Array.from(word).forEach((char, i) => {
    
            let charTry = actTry[i];
    
            if (!charTry) {
                notReady = true;
                return;
            }

            actTryWord += charTry.char;
    
            if (char == charTry.char) {
                charTry.state = charState.correct;
            } else if (word.includes(charTry.char)) {
                charTry.state = charState.inWord;
            } else {
                charTry.state = charState.submitted;
            }
    
        });
    
        if (notReady) {
            return;
        }

        updateActiveGuess();
    
        if (actTryWord == word) {
            onWin();
        } else if (tryCursor + 1 == triesAmount) {
            messageToast("Sorry, you have no tries left!")
            
            var share = document.getElementById('share');

            document.getElementById('share-text').innerText = 'share score';
            share.onclick = onShareScore;

        } else {
            messageToast("Guess submitted!");
        }
        
        return true;
    
    }
    
    function submitChar(char) {
    
        if (charCursor >= wordLength) {
            return;
        }
    
        let obj = tries[tryCursor][charCursor];
    
        if (obj) {
            obj.char = char;
        } else {
            tries[tryCursor][charCursor] = {char, state: 0};
        }
    
        charCursor++;
    
        updateActiveGuess();
    
    }
    submitCharGlobal= submitChar;
    function updateActiveGuess() {
    
        let chars = tries[tryCursor];
    
    
        $(`[data-row=${tryCursor}]`).each((i, el) => {
    
            let char = chars[$(el).data('col')];
    
            $(el).removeClass('wg-char-in-word')
            .removeClass('wg-char-correct');
    
            if (char) {
                $(el).text(char.char);
    
                switch (char.state) {
                    case charState.inWord: 
                        $(el).addClass('wg-char-in-word')
                        break;
                    case charState.correct:
                        $(el).addClass('wg-char-correct')
                        break;
                    case charState.submitted:
                        $(el).addClass('wg-char-submitted');
                        break;
                    
                }
    
            }
            
    
        });
    
    }
    
    function renderGuessList() {
    
        let list = $('.wg-guesses');
        
    
        for (let i = 0; i < triesAmount; i++) {
    
            let row = $('<div class="wg-guess">');
    
            for (let j = 0; j < wordLength; j++) {
                row.append($(`<div class="wg-char" data-row="${i}" data-col="${j}">`));
            }
    
            list.append(row);
    
        }
    
        list.css({opacity: 1})

        $('#share').animate({opacity: 1}, 100);
    
    }
    
    function onWin() {
        
        messageToast("Yay, you won!");

        won = true;
    
        var share = document.getElementById('share');

        document.getElementById('share-text').innerText = 'share score';
        share.onclick = onShareScore;

    }


});

function get(url) {
    return new Promise(resolve => {
        
        $.get(url, (res) => {
            var splits;
            if (res.includes('\r\n')) {
                splits = res.split('\r\n')
            } else {
                splits = res.split('\n')
            }
            resolve(splits);
        })

    });
}
    
function getWords() {
    return Promise.all([
        // Load sources
        get('guess-list.txt'),
        get('word-list.txt')
    ]);
}

function onNewWord() {

    var word = getNewWord();

    var code = encodeWord(word);

    var newLink = `${location.href.replace(/\?.+$/, '')}?w=${code}`;

    window.location = newLink;

}

function onShare() {
    
    toClipboard(location.href);

    messageToast("Play link copied to Clipboard!");


}

function onShareScore() {

    var out = 'My Score on ' + location.href + ':\n\n';

    tries.forEach(row => {

        row.forEach(g => {

            switch(g.state) {
                case charState.inWord:
                    out += '🟨';
                    break;
                case charState.correct:
                    out += '🟩';
                    break;
                default:
                    out += '⬛';
                    break;
            }

        });

        out += '\n';


    });

    toClipboard(out); 

    messageToast("Score copied to Clipboard!");

    document.activeElement.blur();

}

function getNewWord() {

    return wordList[Math.floor(Math.random() * wordList.length)];

}

function toClipboard(txt) {

    console.log(txt);
    navigator.clipboard.writeText(txt);

}

function charTouchInput(event) {

    submitCharGlobal(event.innerText)

}