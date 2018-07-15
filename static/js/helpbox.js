const texts = Object.freeze( {
    'forward' : 'Packages which go throw the Firewall',
    'input' : 'Packages which are addressed to the firewall',
    'output' : 'Packages whichs source is the firewall',
    'ipfrom' : 'The source ip address. It can be either a single address, an addressrange (10.0.0.0:10.0.0.255), or a subnet (10.0.0.0/8)',
    'ipto' : 'The destination ip address. It can be either a single address, an addressrange (10.0.0.0:10.0.0.255), or a subnet (10.0.0.0/8)',
    'ports' : 'The allowed ports. Up to 15 are possible.',
    'newrule' : 'Add a new rule to the firewall.',
    'compile' : 'Compile the current firewall.'
} );

( function init(){
    showHelpText( ["mouseover"], "btn_forward", texts["forward"] );
    showHelpText( ["mouseover"], "btn_input", texts["input"] );
    showHelpText( ["mouseover"], "btn_output", texts["output"] );
    showHelpText( ["mouseover", "focus"], "ip_from", texts["ipfrom"] );
    showHelpText( ["mouseover", "focus"], "ip_to", texts["ipto"] );
    showHelpText( ["mouseover"], "ports", texts["ports"] );
    showHelpText( ["mouseover"], "updateRow", texts["newrule"] );
    showHelpText( ["mouseover"], "compile", texts["compile"] );
} )();

function showHelpText( events, id, text ){
    let target = document.getElementById( id );
    let helpbox = document.getElementById( "helptext" );
    
    events.forEach( event => {
        target.addEventListener( event, e => {
            helpbox.innerHTML = text;
        } );
    } );    
}