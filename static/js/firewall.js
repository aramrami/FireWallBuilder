const rules = [];
const inputs = {
    "PORTS" : /^(0|[1-9][0-9]{0,3}|[1-5][0-9]{4}|6([0-4][0-9]{3}|5([0-4][0-9]{2}|5([0-2][0-9]|3[0-5]))))(,(0|[1-9][0-9]{0,3}|[1-5][0-9]{4}|6([0-4][0-9]{3}|5([0-4][0-9]{2}|5([0-2][0-9]|3[0-5]))))){0,14}$/,
    "BITMASK" : /^[0-7]$"/,
    "IPV4" : /^([1-9]?[0-9]|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))(\.([1-9]?[0-9]|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))){3}((:([1-9]?[0-9]|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))(\.([1-9]?[0-9]|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))){3})|\/([1-2]?[0-9]|3[0-2]))?$/
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
    getValue(){
        return this.bitmask.getValue();
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
        deletebutton.addEventListener( "mouseover", e => {
            document.getElementById( "helptext" ).innerHTML = texts["delete"];
        } );
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

class FirewallTable{
    constructor( json ){
        this.firewalls = JSON.parse( json );
    }
    toHTML(){
        let table = document.createElement( "table" );
        let headrow = document.createElement( "tr" );
        
        table.appendChild( headrow );
        
        for ( let headdata of [ "Title","Creation-Date" ] ) {
            let tablehead = document.createElement( "th" );
            tablehead.innerHTML = headdata;
            headrow.appendChild( tablehead );
        }
        this.firewalls.forEach( element => {
            let row      = document.createElement( "tr" );
            let title    = document.createElement( "td" );
            let date     = document.createElement( "td" );
            let download = document.createElement( "td" );
            let deletion = document.createElement( "td" );
                                    
            title.innerHTML = element["title"];
            date.innerHTML = element["creationDate"];
            download.innerHTML = "<i class='fas fa-cloud-download-alt'></i>";
            download.classList.add( "deletebutton" );
            this.load( download, element["id"] );
            
            deletion.innerHTML = "<i class='fas fa-trash-alt'></i>";
            deletion.classList.add( "deletebutton" );
            this.remove( deletion, element["id"] );
            
            row.appendChild( title );
            row.appendChild( date );
            row.appendChild( download );
            row.appendChild( deletion );
            table.appendChild( row );
        } );
        
        return table;        
    }
    load( domItem, firewallID ){
        domItem.addEventListener( "click", event => {
            let request = new XMLHttpRequest();
            request.open( "GET", `./load/${firewallID}`, true );
            request.onload = () => {
                loadFirewall( request.responseText );
            };
            request.send( null );
        } );
    }
    remove( domItem, firewallID ){
        //TODO
        domItem.addEventListener( "click", event => {
            let request = new XMLHttpRequest();
            request.open( "GET", `./remove/${firewallID}`, true );
            request.onload = () => {
                hideMessage();
            };
            request.send( null );
        } );
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
    let validationObj = isValidRule();

    if ( validationObj[0] ){
        let table = document.querySelector( "table" );
        
        clearTable( table );
        rules.push( createRule() );
        buildTable();
    } else {
        displayMessage( "Some rule options are not valid", validationObj.slice( 1 ) );
    }
    
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
    //console.log( list );
    let request = new XMLHttpRequest();
    
    request.open( "POST", "./compiler", true );
    request.setRequestHeader( "Content-type", "application/json" );
    request.onload = () => {
        switchMainAndScript( request.responseText );
    };
    request.send( json );
}

function saveFirewall(){
    let list = []
    rules.forEach( element => {
        list.push( element.toLeightWeightObject() );
    } );
    let json = JSON.stringify( list );
    let request = new XMLHttpRequest();
    
    request.open( "POST", "./save", true );
    request.setRequestHeader( "Content-type", "application/json" );
    request.onload = () => {
        displayMessage( request.responseText, [] );
    };
    request.send( json );
}

function showFirewalls(){
    let request = new XMLHttpRequest();
    
    request.open( "GET", "./show", true );
    request.onload = () => {
        displayMessage( "Saved Firewalls", new FirewallTable( request.responseText ).toHTML() );
    };
    request.send( null );
}

function loadFirewall( data ){
    console.log( data );
    // TODO
}

function switchMainAndScript( script = null ){
    //console.log( script );
    let mainVisibility   = "block";
    let mainToolbar      = "flex";
    let scriptVisibility = "none";
    let scriptToolbar    = "none";
    let scripttext       = "";
    
    if ( script != null ){
        mainVisibility   = "none";
        mainToolbar      = "none";
        scriptVisibility = "block";
        scriptToolbar    = "flex";
        scripttext = script;
    }    

    document.querySelectorAll( ".main" ).forEach( element => {
        element.style.display = mainVisibility;
    } );
    document.querySelector( "footer" ).style.display = mainToolbar;
    document.querySelectorAll( ".script" ).forEach( element => {
        element.style.display = scriptVisibility;
    } );
    document.querySelector( "nav" ).style.display = scriptToolbar;
    document.getElementById( "script" ).innerHTML = scripttext;
}

function validate( input, regex ){
    if ( regex.test( input.value ) ){
        input.classList.add( "valid" );
    } else {
        input.classList.remove( "valid" );
    }
}

function isValidRule(){
    let validationObj = [ true ];
    
    if ( !inputs["IPV4"].test( document.getElementById( "ip_from" ).value ) ){
        validationObj[0] = false;
        validationObj.push( "Invalid source ip" );
    }
    if ( !inputs["IPV4"].test( document.getElementById( "ip_to" ).value ) ){
        validationObj[0] = false;
        validationObj.push( "Invalid destination ip" );
    }
    if ( !inputs["PORTS"].test( document.getElementById( "ports" ).value ) ){
        validationObj[0] = false;
        validationObj.push( "Invalid ports" );
    }
    if ( buttonGroupDirections.getValue() <= 0 ){
        validationObj[0] = false;
        validationObj.push( "Choose at least one direction" );
    }
    if ( buttonGroupProtocols.getValue() <= 0 ){
        validationObj[0] = false;
        validationObj.push( "Choose at least one protocol" );
    }
    return validationObj;
}

function displayMessage( header, texts ){
    if ( Array.isArray( texts ) ){
        let message = "";
        
        for( let text of texts ){
            message += `${text}<br>`;
        }
        document.getElementById( "messageText" ).innerHTML = message;
    } else {
        document.getElementById( "messageText" ).appendChild( texts );
    }    
    
    document.getElementById( "messageHeader" ).innerHTML = header;    
    document.getElementById( "messageWrapper" ).style.visibility = "visible";
}

function hideMessage(){
    document.getElementById( "messageWrapper" ).style.visibility = "hidden";
}

function scriptToClipboard(){
    document.getElementById( "script" ).select();
    document.execCommand( "copy" );
}

function downloadScript(){
    let payload = document.getElementById( "script" ).value;        
    window.open( "data:application/txt," + encodeURIComponent( payload ), "_self" );
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
    document.getElementById( "saveFirewall" ).onclick = saveFirewall;
    document.getElementById( "loadFirewall" ).onclick = showFirewalls;
    document.getElementById( "hideMessage" ).onclick = hideMessage;
    document.getElementById( "saveScript" ).onclick = downloadScript;
    document.getElementById( "scriptClipboard" ).onclick = scriptToClipboard;
    document.getElementById( "closeScript" ).onclick = () => { 
        switchMainAndScript( null )
    };
} )();