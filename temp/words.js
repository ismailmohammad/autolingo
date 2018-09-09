

var words = ["Bonjour", "Salut", "Merci", "Je", "Tu", "Suis", "Oui", "Non" ];

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

class WordSupplier {
    constructor(words) {
        this.list = shuffle(words.slice(0));
        this.counter = 0;
    }

    get nextWord () {
        var word = this.list[counter++];
        if (this.counter == this.list.length) {
            this.counter = 0;
            this.list = shuffle(this.list.slice(0));
        }
    }
}

