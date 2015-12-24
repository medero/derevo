// this structure will be provided
var people = [
    { "id": 9000, "name": "Mistress", "dob": "1988", "children": [100], "no_parent" : true, "partners": [16] },
    { "id": 9001, "name": "Mistress 2", "dob": "1988", "no_parent" : true, "partners": [16] },
    { "id": 16, "name": "John", "dob": "1988", "children": [12,13,3,11], "no_parent": true, "partners" : [9000] },
    { "id": 10, "name": "Megan", "dob": "1988", "children": [12,13,3,11], "no_parent": true, "partners": [16] },
    { "id": 100, "name": "Hidden Son", "dob": "1988", "parents": [9000,16] },
    { "id": 12, "name": "Jeezy", "dob": "1988", "parents": [16,10] },
    { "id": 13, "name": "Leo", "dob": "1988", "parents": [16,10] },
    { "id": 3, "name": "Chopper", "dob": "1988", "parents": [16,10] },
    { "id": 11, "name": "Khalid", "dob": "1988", "parents": [16,10] },
    { "id": 14, "name": "Child", "dob": "2008", "parents": [3,11] }

    /*
    { "id": "1", "name": "Me", "dob": "1988", "parents": [2,3], "siblings": [4,5] },
    { "id": "2", "name": "Genghis Khan", "dob": "1961", "parents" : [7], "children": [1,4,5] },
    { "id": "3", "name": "Gina Carano", "dob": "1967", "children": [1], "siblings": [6] },
    { "id": "4", "name": "Tim", "dob": "1992", "parents" : [2,3] },
    { "id": "5", "name": "Judy", "dob": "1987", "parents": [2,6] },
    { "id": "6", "name": "Courtney Carano", "dob": "1965", "children": [5], "siblings": [3] },
    { "id": "7", "name": "Grandma Khan", "dob": "1400", "children": [2] }
    */
];

// get the node based on the id

// just dont feel like manually calling it, only enclosed in a function to organize it better
(function addLevels() {

    // generate a level variable to indicate what level each object is on
    people.forEach(function(node, key) {
        walk( node, key );
    });

    // walk through all people and assign a level property based on generation
    function walk( node, key, levelCount ) {

        if ( !node ) 
            throw new Error('walk: Invalid id specified. Make sure data is correct.')

        if ( !levelCount )
            var levelCount = 0;

        // incase the count gets overridden by a lower number during recursion
        people[key]['level'] = Math.max( levelCount, (people[key]['level'] || 0));

        if ( node.children && node.children.length ) {
            node.children.forEach(function(childId) {
                walk( getNodeById(childId), key, levelCount+1 );
            });
        }
    }

    // the flaw with the above is that partners with no children arent accounted for properly
    // their level needs to be set to their partners level
    people.forEach(function(person) {
        if ( person.partners ) {
            person.partners.forEach(function(partnerId) {
                var partner = getNodeById(partnerId);
                person.level = Math.max( person.level, partner.level );
            });
        }
    });

})();

// group by levels
var nested = d3.nest()
    .key(function(el){ return el.level}) // categorize by levels
    .entries(people) // specify what data
    .reverse(); // reverse so highest generation is first

// final data structure to be consumed by d3
var root = {
    name: "",
    id: 1,
    hidden: true,
    children: []
};

var guid = 0;

function recurse( generation, childrenList, index ) {

    // relationships
    var relationships = [];

    // lines of children for this generation
    var children = [];

    function findRelationship(idOne,idTwo) {
        return relationships.filter(function(relationship) {
            return (relationship[0] == idOne && relationship[1] == idTwo)
                || relationship[0] == idTwo && relationship[1] == idOne
        }).length>0;
    };

    // identify partners per generation
    generation.values.forEach(function(person) {

        if ( person.partners ) {
            person.partners.forEach(function(partner) {
                if ( !findRelationship( person.id, partner.id ) ) {
                    relationships.push([person.id, partner.id]);
                }
            });
        }

        if ( person.children ) {
            person.children.forEach(function(id) {
                var child = getNodeById(id);
                children.push( child );
            });
        }

    });

    // one object per unique parent/parents ( can be one parent )
    var childrenObjs = [];

    function findObj(parentArray, childrenObjs) {
        var ret = false;

        //console.log(childrenObjs.length)

        for ( var i = 0, l = childrenObjs.length; i<l; ++i ) {
            var obj = childrenObjs[i];

            // if single parent
            if ( parentArray.length == 1 ) {
                if ( obj.parents[0] == parentArray[0] )
                    ret = obj;
                    break;
            // if both parents match
            } else if ( parentArray.length == 2 ) {
                if ( 
                    (obj.parents[0] == parentArray[0] && obj.parents[1] == parentArray[1] ) ||
                    (obj.parents[1] == parentArray[0] && obj.parents[0] == parentArray[1])
                )  {
                    ret = obj;
                    break;
                }
            }
        };

        return ret;
    };

    children.forEach(function(child) {
        var obj = findObj( child.parents, childrenObjs )
        if ( obj ) {
            if ( obj.children.indexOf( child.id ) == -1 )
                obj.children.push( child.id )
        } else {
            childrenObjs.push({
                parents: child.parents,
                children: [child.id]
            })
        }
    });



    childrenObjs.forEach(function(obj) {
        guid++;
        childrenList.push({
            name: "",
            id: 'invisible_' + guid,
            no_parent: true,
            hidden: true,
            children: []
        })
    });

    if ( nested[index+1] ) {
        childrenList.push(children);
    }

    // for each person in this generation..
    generation.values.forEach(function(person) {
        var o = {
            name: person.name,
            id: person.id
        };

        if ( o.parents == null ) {
            o['no_parent'] = true;
        }

        if ( childrenList.filter(function(obj) { return obj.id == person.id }).length == 0 )
            childrenList.unshift(o);

        if ( nested[index+1] ) {
            recurse( nested[index+1], person.children, index+1 );
        }
    });

}

recurse( nested[0], root.children, 0 );

var margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
},
    width = 840,
    height = 600;

var kx = function (d) {
    return d.x - 20;
};

var ky = function (d) {
    return d.y - 10;
};

//thie place the text x axis adjust this to center align the text
var tx = function (d) {
    return d.x - 3;
};

//thie place the text y axis adjust this to center align the text
var ty = function (d) {
    return d.y + 3;
};

//make an SVG
var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//My JSON note the 
//no_parent: true this ensures that the node will not be linked to its parent
//hidden: true ensures that the nodes is not visible.
/*

var root = {
    name: "",
    id: 1,
    hidden: true,
    children: [{
        name: "Johns Mother",
        id: 7000,
        no_parent: true
    }, {
        name: "",
        id: 2,
        no_parent: true,
        hidden: true,
        children: [{
            name: "Mistress",
            id: 9000,
            no_parent: true
        }, {
            name: "John",
            id: 16
        }, {
            name: "",
            id: 2,
            no_parent: true,
            hidden: true,
            children: [{
                    name: "Hidden Son",
                    id: 9001
                },

                {
                    name: "Jeezy",
                    id: 12,

                }, {
                    name: "Leo",
                    id: 13,
                    no_parent: true
                }, {
                    name: "Chopper",
                    id: 3
                }, {
                    name: "",
                    id: 4,
                    hidden: true,
                    no_parent: true,
                    children: [{
                        name: "Dino",
                        id: 5,
                    }, {
                        name: "",
                        id: 14,
                        hidden: true,
                        no_parent: true,
                        children: [{
                            name: "Percy",
                            id: 15,
                        }]
                    }, {
                        name: "EazyE",
                        id: 6,
                    }]
                }, {
                    name: "Khalid",
                    id: 11
                }, {
                    name: "GFunk",
                    id: 7,
                    children: [{
                        name: "Hobo",
                        id: 8,
                    }, {
                        name: "Illiac",
                        id: 9,
                    }]
                }
            ]
        }, {
            name: "Megan",
            id: 10,
            no_parent: true,
            children: [

            ]
        }]
    }]
}
*/


var allNodes = flatten(root);
//This maps the siblings together mapping uses the ID using the blue line
var siblings = [{
    source: {
        id: 3,
        name: "C"
    },
    target: {
        id: 6,
        name: "K"
    }
},
];

// Compute the layout.
var tree = d3.layout.tree().size([width, height]),
    nodes = tree.nodes(root),
    links = tree.links(nodes);

// Create the link lines.
svg.selectAll(".link")
    .data(links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", elbow);


var nodes = svg.selectAll(".node")
    .data(nodes)
    .enter();

//First draw sibling line with blue line
svg.selectAll(".sibling")
    .data(siblings)
    .enter().append("path")
    .attr("class", "sibling")
    .attr("d", sblingLine);

// Create the node rectangles.
nodes.append("rect")
    .attr("class", "node")
    .attr("height", 20)
    .attr("width", 40)
    .attr("id", function (d) {
    return d.id;
})
    .attr("display", function (d) {
    if (d.hidden) {
        return "none"
    } else {
        return ""
    };
})
    .attr("x", kx)
    .attr("y", ky);
// Create the node text label.
nodes.append("text")
    .text(function (d) {
    return d.name;
})
    .attr("x", tx)
    .attr("y", ty);


/**
This defines teh line between siblings.
**/
function sblingLine(d, i) {
    //start point
    var start = allNodes.filter(function (v) {
        if (d.source.id == v.id) {
            return true;
        } else {
            return false;
        }
    });
    //end point
    var end = allNodes.filter(function (v) {
        if (d.target.id == v.id) {
            return true;
        } else {
            return false;
        }
    });
    //define teh start coordinate and end co-ordinate
    var linedata = [{
        x: start[0].x,
        y: start[0].y
    }, {
        x: end[0].x,
        y: end[0].y
    }];
    var fun = d3.svg.line().x(function (d) {
        return d.x;
    }).y(function (d) {
        return d.y;
    }).interpolate("linear");
    return fun(linedata);
}

/*To make the nodes in flat mode.
This gets all teh nodes in same level*/
function flatten(root) {
    var n = [],
        i = 0;

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        n.push(node);
    }
    recurse(root);
    return n;
}
/** 
This draws the lines between nodes.
**/
function elbow(d, i) {
    if (d.target.no_parent) {
        return "M0,0L0,0";
    }
    var diff = d.source.y - d.target.y;
    //0.40 defines the point from where you need the line to break out change is as per your choice.
    var ny = d.target.y + diff * 0.40;

    linedata = [{
        x: d.target.x,
        y: d.target.y
    }, {
        x: d.target.x,
        y: ny
    }, {
        x: d.source.x,
        y: d.source.y
    }]

    var fun = d3.svg.line().x(function (d) {
        return d.x;
    }).y(function (d) {
        return d.y;
    }).interpolate("step-after");
    return fun(linedata);
}

/*
var boxWidth = 100, boxHeight = 90;

var g = d3.select('body')
    .append('svg')
    .attr('width', '500')
    .attr('height', '500')
    .append('g')

var rect = g 
    .attr('width', '500')
    .attr('height', '500')
    .selectAll('.node')
    .data(nested)
    .enter()
    .append('rect')
    .attr('width', boxWidth)
    .attr('height', boxHeight)
    .attr('x', function(d,i){ return 0; })
    .attr('y', function(d,i){ return boxHeight*i+1 })
    .style('fill', 'tan')

rect.append('text')
    */
    /*
    .attr('stroke-style', 'solid pink')
    .attr('stroke-width', '1px')
    .attr('stroke', 'red')
    */

