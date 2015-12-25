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

/*
var tree = [
    { "id" : 1, "name" : "Me", root: true }
];
*/

function getNodeById(id) {
    var temp = tree.filter(function(el) { return el.id == id });
    return temp.length ? temp[0] : null;
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
}

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
}

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
function generateBlock( caption, offset ) {

    var $div = $('<div/>').addClass('block').css({
        top:offset.top,
        left: offset.left
    }).text(caption)

    return $div;
}

function appendNode( context, data ) {

    var newNode = {
        siblings: [],
        children: [],
        partners: [],
        parents: [],
        element: null
    },

    id = ++guid;

    switch ( data.relationship ) {
        case 'brother':
        case 'sister':
            newNode.siblings.push( id );
        break;

        case 'mother':
        case 'father':
            newNode.parents.push( id );
        break;

        case 'partner':
            newNode.partners.push( id );
        break;
    }

    // push onto the list
    tree.push( newNode );

    // set the current node
    currentNode = newNode;

    render( tree, newNode );

}

$('form').on('submit', function(e) { 
    e.preventDefault();

    appendNode( currentNode, {
        relationship: $('#add').val()
    });
});

// on clicking any block, scroll into that block
$(canvas).on('click', '.block', function() {
    $(this).scrollIntoView();
});

function render( tree, currentNode ) {

    // nest the tree by level
    var nested = d3.nest().key(function(o){ return o.level }).entries(tree)

    function compare(a,b) {
        if (parseInt(a.key, 10) > parseInt(b.key,10)) return -1;
        if (parseInt(a.key, 10) < parseInt(b.key,10)) return 1;
        return 0;
    }

    // reorder this since it doesnt properly order them by the key
    nested = nested.sort(compare)

    var t = 0;

    nested.forEach(function(level){

        t+= verticalPadding + blockHeight;

        var left = 0;

        level.values.forEach(function(o) {
            left+= horizontalPadding + blockWidth;

            var div = generateBlock ( o.name, {
                top: t,
                left: left
            });

            $(canvas).append(div);

            o.element = div;

        });

    });
}

// add the root node
$(window).load(function() {
    render(tree, tree[0]);
});
