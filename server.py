from flask import render_template, Flask, request
from modules.options import mapJsonToRule

app = Flask(__name__)

@app.route( "/" )
def index():
    return render_template( "index.html" )

@app.route( "/compiler", methods=["POST"] )
def compiler():
    mapJsonToRule( request.get_json() )
    return "Answer"

if __name__ == "__main__":
    app.run()
