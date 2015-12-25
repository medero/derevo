/**
 *
 * Validate the integrity of the data structure for the family graph. 
 * Make sure there are no missing ids
 *
 */

function validate( data ) {

    if ( !data || data.length === 0 ) {
        throw new Error('data is empty');
        return false;
    }

    // get the root node
    var root = data.filter(function(el) {
        return el.root === true
    });

    if ( root.length === 0 ) {
        throw new Error('No root specified. Please specify root:true on a node.');
        return false;
    }

    function log( message ) {
        if ( window.console && console.log ) {
            console.log( message );
        }
    }

    var listTypes = [
        {name: 'children', 'label': 'child'},
        {name: 'parents', 'label': 'parent'},
        {name: 'sibling', 'label': 'sibling'},
        {name: 'partners', 'label': 'partner'},
    ];

    // check for invalid ids in children, parents, partners or siblings
    data.forEach(function(person) {
        listTypes.forEach(function(type) {
            if ( person[type.name] ) {
                person[type.name].forEach(function(id) {
                    if ( getNodeById( id ) == null ) throw new Error('walk: invalid ' + type.label + ' id `' + id + '`specified for ' + person.name + '. Make sure data is correct' )
                });
            }
        });

    });

};
