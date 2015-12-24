// this structure will be provided
var data = [
    { "id": 9000, "name": "Mistress", "dob": "1988", "children": [100], "no_parent" : true, "partners": [16] },
    { "id": 9001, "name": "Mistress 2", "dob": "1988", "no_parent" : true, "partners": [16] },
    { "id": 16, "name": "Me", "dob": "1988", "children": [12,13,3,11], "no_parent": true, "partners" : [9000], root:true },
    { "id": 10, "name": "Megan", "dob": "1988", "children": [12,13,3,11], "no_parent": true, "partners": [16] },
    { "id": 100, "name": "Hidden Son", "dob": "1988", "parents": [9000,16] },
    { "id": 12, "name": "Jeezy", "dob": "1988", "parents": [16,10] },
    { "id": 13, "name": "Leo", "dob": "1988", "parents": [16,10] },
    { "id": 3, "name": "Chopper", "dob": "1988", "parents": [16,10] },
    { "id": 11, "name": "Khalid", "dob": "1988", "parents": [16,10] },
    { "id": 14, "name": "Child", "dob": "2008", "parents": [3,11] }
];

// log any errors with the data structure
validate(data);

// we have a valid dataset. parse it.
function getRoot() {
    return data.filter(function(node) { 
        return node.root === true;
    })[0];
}

var root = getRoot();

$(canvas).on('click', '.block', function() {
    $(this).scrollIntoView();
});

$('.block.me').center().scrollIntoView();
