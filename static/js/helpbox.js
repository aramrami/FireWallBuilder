const texts = Object.freeze( {
    'forward' : 'Packages which go throw the Firewall',
    'input' : 'Packages which are addressed to the firewall',
    'output' : 'Packages whichs source is the firewall'
} );

( function init(){
    document.getElementById( "btn_forward" ).onmouseover = () => {
        showHelpText( texts['forward'] );
    }
    document.getElementById( "btn_input" ).onmouseover = () => {
        showHelpText( texts['input'] );
    }
    document.getElementById( "btn_output" ).onmouseover = () => {
        showHelpText( texts['output'] );
    }
} )();

function showHelpText( text ){
    document.getElementById( "helpbox" ).innerHTML = text;
}