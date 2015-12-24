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

        var genCounter = 0,
            blockWidth = 100,
            blockHeight = 90,
            currentNode = null,
            canvas = $('#inner-canvas'),
            RELATIONSHIPS = {
                'PARTNER' : 1
            }

        $.fn.center = function() {
            var width = canvas.width(), height = canvas.height();

            var offset = $(this).offset();

            $(this).css({
                top: ((width-blockWidth)/2),
                left: ( (height-blockHeight)/2 )
            })
            
            return this;
        }
        
        $.fn.scrollIntoView = function() {
            $('.block').removeClass('active')
            $(this).addClass('active')
            
            currentNode = this;
            
            $('#wrap').animate({
                scrollTop: $(this).offset().top - $(canvas).offset().top - $('#wrap').height() / 2 + 60,
                scrollLeft: $(this).offset().left - $(canvas).offset().left - $('#wrap').width() / 2 + 60
            }, 500)
            
            return this;
        }
        
        // get the current nodes offset to use as a base for the next node
        function getCurrentNodeOffset() {
            var nodeOffset = $(currentNode).offset(), parentOffset = $(canvas).offset();
            var offset = {
                top: nodeOffset.top - parentOffset.top,
                left: nodeOffset.left - parentOffset.left
            };
            return offset;
        }

        function generateBlock( caption ) {
            var div = $('<div/>').addClass('block').css({
            }).text(caption).appendTo(canvas)
        }
        
/*
        function generateBlock( caption, offset ) {
            var div = $('<div/>').addClass('block').css({
                top:offset.top,
                left: offset.left
            }).text(caption).appendTo(canvas)
            
            return div;
        }
*/
        
        function addNode( type, relationship ) {
            switch ( type ) {
                case 'parents':
                        addNode( 'mother' )
                        
                        // specify 2nd argument so it pairs father with the mother as they are partners
                        addNode( 'father', RELATIONSHIPS.PARTNER )
                    break;
                    
                case 'father':
                        var offset = getCurrentNodeOffset();
                    
                        if ( relationship == RELATIONSHIPS.PARTNER ) {
                            var t = offset.top; // same level
                            var l = offset.left + ( blockWidth + 25 );
                        } else {
                            var t = offset.top - (blockHeight + 123 ); // higher
                            var l = offset.left - ( blockWidth - 25 );
                        }
                    
                        var div = generateBlock('father', { top: t, left: l})
                        
                        div.scrollIntoView();
                    break;
                    
                case 'mother':
                        var offset = getCurrentNodeOffset();
                    
                        if ( relationship == RELATIONSHIPS.PARTNER ) {
                            var t = offset.top; // same level
                            var l = offset.left - ( blockWidth - 25 );
                        } else {
                            var t = offset.top - (blockHeight + 123 ); // higher
                            var l = offset.left - ( blockWidth - 25 );
                        }
                        
                        var div = generateBlock('mother', { top: t, left: l})
                        div.scrollIntoView();
                    break;
                case 'brother':
                case 'sister':
                        var offset = getCurrentNodeOffset();
                        alert('1');
                break;
            }
        }

$(canvas).on('click', '.block', function() {
    $(this).scrollIntoView();
});

$('.block.me').center().scrollIntoView();
