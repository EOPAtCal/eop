function createElemWithClass(type, className) {
    var elem = document.createElement(type);
    elem.className = className;
    return elem;
}


function createCard(item) {
    var elem = createElemWithClass('div', 'card');
    var keysLen = Object.keys(item).length;

    for (var i = 0; i < keysLen.length; i++) {
        var k = keysLen[i];
    }
}


function createRow(items) {
    var row = createElemWithClass('div', 'card-deck');
    var cards = []
    for (var i = 0; i < items.length; i++) {
        var card = createCard(items[i])
        card.append(card);
        row.appendChild()
    }
}


function render(users, numberPerRow) {
    var rootElem = document.getElementById('root');
    var len = users.length;
    var i;

    for (i = numberPerRow; i < len; i += numberPerRow) {
        root.appendChild(createRow(users.slice(i - numberPerRow, i)));
    }

    if (i < len - 1) {
        root.appendChild(createRow(users.slice(i - numberPerRow, len)));
    }
}

(require(["text!sample-json-for-card.json"], function(sample) {
    var users = JSON.parseJSON(sample);
    render(users);
}))();

var json = require(['text!sample-json-for-card.json']);