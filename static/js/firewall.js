const rules = [];

class Rule{
    constructor( direction, protocol, ipFrom, ipTo, ports, comment ){
        this.number    = -1;
        this.direction = direction;
        this.protocol  = protocol;
        this.ipFrom    = ipFrom;
        this.ipTo      = ipTo;
        this.ports     = ports;
        this.comment   = comment;        
    }
    toHTML(){
        let tableRow = document.createElement( "tr" );
        let me       = this;
        
        for ( let property in this ) {
            if ( this.hasOwnProperty( property ) ) {
                let tabledata = document.createElement( "td" );
                tabledata.innerHTML = this[property];
                tableRow.appendChild( tabledata );
            }
        }
        
        let deletebutton = document.createElement( "td" );
        deletebutton.innerHTML = '<i class="fas fa-trash-alt"></i>'
        deletebutton.classList.add( "deletebutton" );
        deletebutton.onclick = function(){
            deleteRule( me );
        };
        tableRow.appendChild( deletebutton );
        
        return tableRow;
    }
}

function createRule(){
    return new Rule(
        "TODO",
        "TODO",
        document.getElementById( "ip_from" ).value,
        document.getElementById( "ip_to" ).value,
        document.getElementById( "ports" ).value,
        document.getElementById( "comment" ).value
    );
}

function newRule(){
    let table = document.querySelector( "table" );
    
    clearTable( table );
    rules.push( createRule() );
    buildTable();
}

function deleteRule( rule ){
    rules.splice( rule.number - 1, 1 );
    clearTable( document.querySelector( "table" ) );
    buildTable();
}

function clearTable( table ){
    while ( table.childNodes.length > 2 ) {
        table.removeChild( table.lastChild );
    }
}

function buildTable(){
    let currentNumber = 1;
    let table         = document.querySelector( "table" );
    
    rules.forEach( rule => {
        rule.number = currentNumber++;
        table.appendChild( rule.toHTML() );
    } );
}

( function init(){
    document.getElementById( "updateRow" ).onclick = newRule;
} )();