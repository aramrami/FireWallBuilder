const rules = [];
const inputs = {
    "PORTS" : /^(0|[1-9][0-9]{0,3}|[1-5][0-9]{4}|6([0-4][0-9]{3}|5([0-4][0-9]{2}|5([0-2][0-9]|3[0-5]))))([,\-](0|[1-9][0-9]{0,3}|[1-5][0-9]{4}|6([0-4][0-9]{3}|5([0-4][0-9]{2}|5([0-2][0-9]|3[0-5]))))){0,9}$/,
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

class BitMask{
    constructor( keypack ){        
        this.NONE = new BitEntry( 0 );        
        let bit = 0;
        for ( let keyname of keypack ){
            this[keyname] = new BitEntry( Math.pow( 2, bit++ ) );
        }
    }
    build( number ){
        let bit = 0;
        for ( let property in this ) {
            if ( this.hasOwnProperty( property ) && this[property].value != 0 ){
                if ( ( number & Math.pow( 2, bit ) ) == Math.pow( 2, bit ) ) {
                    this[property].toggle(); 
                }
                bit += 1;
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
    getActiveKeys(){
        let keystring = "";
        for ( let property in this ) {
            if ( this.hasOwnProperty( property ) && this[property].active ) {
                keystring += `${property}, `;
            }
        }
        if ( 0 < keystring.length ){
            keystring = keystring.slice( 0, -2 );
        }
        return keystring;
    }
    toggleKey( keyname ){
        this[keyname].toggle();
    }
}

class BitMaskButtonGroup{
    constructor( domID ){
        let ids = [];
        document.querySelector( `#${domID}` ).childNodes.forEach( element => {
            if ( element.id ){
                ids.push( element.id );
            }            
        } );
        this.bitmask = new BitMask( ids );
        
        var closure = this.bitmask;
        ids.forEach( id => {
            document.getElementById( id ).addEventListener( "click", event => {
                closure.toggleKey( id );
                event.target.classList.toggle( "choosebuttonactive" );
            } );
        } );
    }
}

class Rule{
    constructor( direction, protocol, ipFrom, ipTo, ports, comment ){
        this.number    = -1;
        this.direction = new BitMask( ["FORWARD", "INPUT", "OUTPUT"] );
        this.direction.build( direction );
        this.protocol  = new BitMask( ["TCP", "UDP", "ICMP"] );
        this.protocol.build( protocol );
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
                if ( this[property] instanceof BitMask ){
                    tabledata.innerHTML = this[property].getActiveKeys();
                } else {
                    tabledata.innerHTML = this[property];
                }
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
    toLeightWeightObject(){
        return {
            "direction" : this.direction.getValue(),
            "protocol" : this.direction.getValue(),
            "ipFrom" : this.ipFrom,
            "ipTo" : this.ipTo,
            "ports" : this.ports,
            "comment" : this.comment
        };
    }
}

function createRule(){
    return new Rule(
        buttonGroupDirections.bitmask.getValue(),
        buttonGroupProtocols.bitmask.getValue(),
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

function sendFireWall(){
    let list = []
    rules.forEach( element => {
        list.push( element.toLeightWeightObject() );
    } );
    let json = JSON.stringify( list );
    console.log( list );
    let request = new XMLHttpRequest();
    
    request.open( "POST", "./compiler", true );
    request.setRequestHeader( "Content-type", "application/json" );
    request.onload = () => {
        console.log( request.responseText );
    };
    request.send( json );
}

function validate( input, regex ){
    if ( regex.test( input.value ) ){
        input.classList.add( "valid" );
    } else {
        input.classList.remove( "valid" );
    }
}

const buttonGroupDirections = new BitMaskButtonGroup( "group_directions" );
const buttonGroupProtocols = new BitMaskButtonGroup( "group_protocols" );

( function init(){
    document.getElementById( "updateRow" ).onclick = newRule;
    document.getElementById( "compile" ).onclick = sendFireWall;
    document.getElementById( "ip_from" ).addEventListener( "keyup", event => {
        validate( event.target, inputs["IPV4"] );
    } );
    document.getElementById( "ip_to" ).addEventListener( "keyup", event => {
        validate( event.target, inputs["IPV4"] );
    } );
    document.getElementById( "ports" ).addEventListener( "keyup", event => {
        validate( event.target, inputs["PORTS"] );
    } );
} )();