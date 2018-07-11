const rules = [];
const inputs = {
    "PORTS" : /^(0|[1-9][0-9]{0,3}|[1-5][0-9]{4}|6([0-4][0-9]{3}|5([0-4][0-9]{2}|5([0-2][0-9]|3[0-5]))))$/,
    "BITMASK" : /^[0-7]$"/,
    "IPV4" : /^TODO$/
};

class BitEntry{
    constructor( value ){
        this.value  = value;
        this.active = false;
    }
    toggle(){
        this.active = !this.active;
    }
}

class Bitmask{
    constructor(){        
        this.NONE = new BitEntry( 0 );        
        let bit = 0;
        for ( let argument of arguments ){
            this[argument] = new BitEntry( Math.pow( 2, bit++ ) );
        }
    }
    build( number ){
        let bit = 0;
        for ( let property in this ) {
            if ( this.hasOwnProperty( property ) && ( this[property].value & Math.pow( 2, bit++ ) == this[property].value) ) {
                this[property].toggle();
            }
        }
    }
    getValue(){
        let val = 0;
        for ( let property in this ) {
            if ( this.hasOwnProperty( property ) && this[property].active ) {
                val += this[property].value;
            }
        }
        return val;
    }
}

var test = new Bitmask( "TCP", "UDP", "ICMP" );
test.build( 7 );
console.log( test.getValue() );

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
    console.log( JSON.stringify( rules ) );
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