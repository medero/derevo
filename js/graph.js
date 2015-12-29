// this structure will be provided
var tree = [
    { "id": 1, "name": "Me", "dob": "1988", "children": [6,7,8,9], "partners" : [2], root:true, level: 0, parents: [12] },
    { "id": 2, "name": "Mistress", "dob": "1988", "children": [5], "partners": [1],  level: 0 },
    { "id": 3, "name": "Mistress 2", "dob": "1988",  "partners": [1], level: 0 },
    { "id": 4, "name": "Megan", "dob": "1988", "children": [6,7,8,9], "partners": [1], level: -1 },
    { "id": 5, "name": "Hidden Son", "dob": "1988", "parents": [2,1], level: -1 },
    { "id": 6, "name": "Jeezy", "dob": "1988", "parents": [1,4], level: -1 },
    { "id": 7, "name": "Leo", "dob": "1988", "children": [11], "parents": [1,4], level: -1 },
    { "id": 8, "name": "Chopper", "dob": "1988", "parents": [1,4], level: -1 },
    { "id": 9, "name": "Khalid", "dob": "1988", "parents": [1,4], level: -1 },
    { "id": 10, "name": "Child", "dob": "2008", "parents": [8,9], level: -2 },
    { "id": 11, "name": "SuperChild", "dob": "2008", "parents": [10], level: -3 },
    { "id": 12, "name": "Grandpap", "dob": "2008", children: [1], level: 1 }
];

function Queue() {

    var items = [];

    this.enqueue = function( element ) {
        items.push( element );
    }

    this.dequeue = function() {
        return items.shift();

    }

    this.front = function() {
        return items[0];
    }

    this.clear = function() {
        items = [];
    }

    this.isEmpty = function() {
        return items.length == 0;
    }

    this.size = function() {
        return items.length;
    }

    this.print = function() {
        console.log( items.toString() );
    }
};

function Dictionary() {

    var items = {};

    this.set = function(key, value){
        items[key] = value; //{1}
    };

    this.remove = function(key){
        if (this.has(key)){
            delete items[key];
            return true;
        }
        return false;
    };

    this.has = function(key){
        return items.hasOwnProperty(key);
        //return value in items;
    };

    this.get = function(key) {
        return this.has(key) ? items[key] : undefined;
    };

    this.clear = function(){
        items = {};
    };

    this.size = function(){
        return Object.keys(items).length;
    };

    this.keys = function(){
        return Object.keys(items);
    };

    this.values = function(){
        var values = [];
        for (var k in items) {
            if (this.has(k)) {
                values.push(items[k]);
            }
        }
        return values;
    };

    this.each = function(fn) {
        for (var k in items) {
            if (this.has(k)) {
                fn(k, items[k]);
            }
        }
    };

    this.getItems = function(){
        return items;
    }
}

/*
var tree = [
    { "id" : 1, "name" : "Me", root: true, siblings: [], children: [], parents: [], partners: [], level: 0 }
];
*/

var edges = [
];

function getNodeById(id) {
    var temp = tree.filter(function(el) { return el.id == id });
    return temp.length ? temp[0] : null;
}

function expose(variable) {
    window[variable] = variable;
}

// log any errors with the data structure
validate(tree);

// we have a valid dataset. parse it.
function getRoot() {
    return tree.filter(function(node) { 
        return node.root === true;
    })[0];
}

var root = getRoot(),
    guid = 1,
    genCounter = 0,
    blockWidth = 100,
    blockHeight = 90,

    horizontalPadding = 45,
    verticalPadding = 45,

    currentNode = root,
    canvas = $('#inner-canvas'),
    RELATIONSHIPS = {
        'PARTNER' : 1
    }

$.fn.center = function() {
    var width = canvas.width(), height = canvas.height();

    //var offset = $(this).offset();

    $(this).css({
        top: ((width-blockWidth)/2),
        left: ( (height-blockHeight)/2 )
    })

    return this;
};

$.fn.scrollIntoView = function() {
    var $wrap = $('#wrap'),
        $allBlocks = $('.block')

    $allBlocks.removeClass('active')
        $(this).addClass('active')

    $wrap.animate({
        scrollTop: $(this).offset().top - $(canvas).offset().top - $wrap.height() / 2 + 60,
        scrollLeft: $(this).offset().left - $(canvas).offset().left - $wrap.width() / 2 + 60
    }, 500)

    return this;
};

// get the current nodes offset to use as a base for the next node
function getCurrentNodeOffset() {
    var nodeOffset = $(currentNode.element).offset(), parentOffset = $(canvas).offset();
    var offset = {
        top: nodeOffset.top - parentOffset.top,
        left: nodeOffset.left - parentOffset.left
    };
    return offset;
}

// generate the div block and return it
function generateBlock( person, offset ) {

    var $div = $('<div/>').addClass('block').css({
        top:offset.top,
        left: offset.left
    }).text(person.name)

    $div.attr('data-node', person.id );

    return $div[0];
}

function appendNode( context, person ) {

    var newNode = {
        siblings: [],
        children: [],
        partners: [],
        parents: [],
        element: null,
        level: null,
        name: ''
    },

    id = ++guid;

    newNode.id = id;
    newNode.name = person.name;

    switch ( person.relationship ) {
        case 'brother':
        case 'sister':
            currentNode.siblings.push( id );
            newNode.level = currentNode.level;
        break;

        case 'mother':
        case 'father':
            currentNode.parents.push( id );
            newNode.level = currentNode.level + 1;
        break;

        case 'partner':
            currentNode.partners.push( id );
            newNode.level = currentNode.level;
        break;

        case 'child':
            currentNode.children.push( id );
            newNode.level = currentNode.level -1;
        break;
    }

    // push onto the list
    tree.push( newNode );

    // set the current node
    currentNode = newNode;

    // clear the tree
    clearTree();

    // render the whole tree
    render( tree, newNode );

}

$('form').on('submit', function(e) { 

    e.preventDefault();

    if ( $('#name-person').val().length === 0 ) {
        alert('Enter a name.');
        return;
    }

    appendNode( currentNode, {
        relationship: $('#add').val(),
        name: $('#name-person').val()
    });

    $(currentNode.element).addClass('active')

    clearForm();

});

function clearForm() {
    $('#enter-person').find(':input').not('[type="submit"]').val('');
}

// on clicking any block, scroll into that block
$(canvas).on('click', '.block', function() {

    // scroll into the view
    $(this).scrollIntoView();

    // reset the current node
    currentNode = getNodeById( $(this).attr('data-node'));

});

var dict = new Dictionary;

function render( tree, currentNode ) {

    // nest the tree by level
    var nested = d3.nest().key(function(o){ return o.level }).entries(tree)

    function compare(a,b) {

        if (parseInt(a.key, 10) > parseInt(b.key,10)) return -1;

        if (parseInt(a.key, 10) < parseInt(b.key,10)) return 1;

        return 0;
    }

    // reorder this since it doesnt properly order them by the key
    nested = nested.sort(compare);

    var limit = 10, counter = 0, first = null;

    walk( nested[0]['values'][0] );

    /*
    var t = 0;

    nested.forEach(function(level) {

        t+= verticalPadding + blockHeight;

        var left = 0;

        level.values.forEach(function(person) {
            left+= horizontalPadding + blockWidth;

            var div = generateBlock ( person, {
                top: t,
                left: left
            });

            $(canvas).append(div);

            person.element = div;

        });

    });
    */

    function walk( person, fromPersonId, callback ) {

        if ( callback )
            callback();

        if ( dict.get(person.id) == null )
            dict.set(person.id, []);

        if ( fromPersonId !== undefined ) {
            if ( dict.get(fromPersonId) == null ) {
                dict.set(fromPersonId, []);
            }

            if ( dict.get(fromPersonId).indexOf(person.id) == -1 )
                dict.get(fromPersonId).push( person.id );
        }

        console.log( person.name );
        counter++;

        var iterable = ['partners', 'siblings', 'children', 'parents'];
        iterable.forEach(function(property) {
            if ( person[property] ) {
                person[property].forEach(function(nodeId) {

                    console.log(dict.get(person.id));
                    if ( dict.get(person.id).indexOf(nodeId) == -1 )
                        walk( getNodeById( nodeId ), person.id, function() {
                            dict.get(person.id).push( nodeId );
                        });
                });
            }
        });


    }
}


function clearTree() {
    $('.block').remove();
}

// add the root node
$(window).load(function() {
    render(tree, tree[0]);
});
