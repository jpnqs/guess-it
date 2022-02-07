function encodeWord(word) {

    var out = '';

    Array.from(word).forEach(char => {
        out += char.charCodeAt(0) + ':';
    });

    return btoa(out.replace(/:$/, ''));

}

function decodeWord(hash) {
    
    var out = '';

    atob(hash).split(':').forEach(charCode => {
        out += String.fromCharCode(charCode);
    });

    return out;
    
}

function messageToast(msg) {

    Toastify({
        text: msg,
        duration: 3000,
        close: false,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        className: 'wg-toast',
        style: {
            background: '#252c2e',
            boxShaddow: "none"
        }
      }).showToast();
      

}