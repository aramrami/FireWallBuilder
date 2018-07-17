from flask import render_template, Flask, request, abort
from modules.options import mapJsonToRule

app = Flask(__name__)

class ContentLength():
    def __init__( self, maxSize ):
        self.maxSize = maxSize
        self.route = None
        
    def wrappedRoute( self, *args ):
        length = request.content_length
        if length is not None and length > self.maxSize:
            abort( 413 )
        return self.route( *args )
    
    def __call__( self, route ):
        self.route = route
        return self.wrappedRoute
    
@app.route( "/" )
def index():
    return render_template( "index.html" )

@app.route( "/compiler", methods=["POST"] )
@ContentLength( 4096 )
def compiler():
    mapJsonToRule( request.get_json() )
    return "Answer"

if __name__ == "__main__":
    #app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024
    app.run()
