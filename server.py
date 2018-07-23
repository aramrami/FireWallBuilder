from flask import render_template, Flask, request, abort, make_response
from modules.options import mapJsonToRule, buildFirewall, Firewall
from modules.sanitizer import isValidRule
from modules.dbhandler import buildDatabase, Connection

app = Flask(__name__)
db  = "./database/firewall.db"

class ContentLength():
    def __init__( self, maxSize ):
        self.maxSize = maxSize
        self.route = None
        
    def wrappedRoute( self, *args, **kwargs ):
        length = request.content_length
        if length is not None and length > self.maxSize:
            abort( 413 )
        return self.route( *args, **kwargs )
    
    def __call__( self, route ):
        self.route = route
        return self.wrappedRoute
    
@app.route( "/" )
def index():
    return render_template( "index.html" )

@app.route( "/compiler", methods=["POST"] )
@ContentLength( 4096 )
def compiler():
    rules = mapJsonToRule( request.get_json() )
    if isValidRule( rules ):
        outputScript = buildFirewall( rules )
    else:
        abort( 500 )
    return outputScript

@ContentLength( 4096 )
@app.route( "/save", methods=["POST"] )
def save():
    rules = mapJsonToRule( request.get_json() )    
    if isValidRule( rules ):
        if 0 >= len( rules ):
            return "There has to be at least one rule"
        firewall = Firewall( rules )
        with Connection( db ) as cursor:
            firewall.insert( cursor )
    return "Firewall saved"

@ContentLength( 128 )
@app.route( "/load" )
def load():
    return "TODO"

if __name__ == "__main__":
    #app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
    buildDatabase( db, "./database/dbstructure.sql" )
    app.run()
