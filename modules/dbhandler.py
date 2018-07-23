import sqlite3

def loadSqlScript( path ):
    script = ""
    with open( path, "r" ) as file:
        for line in file:
            script += line
    return script

def buildDatabase( connectionstring, scriptpath ):
    with Connection( db = connectionstring ) as cursor:
        cursor.executescript( loadSqlScript( scriptpath ) )

class Connection():
    def __init__( self, db = ":memory:" ):
        self.db = db
        
    def __enter__( self ):
        self.connection = sqlite3.connect( self.db )
        self.connection.row_factory = sqlite3.Row
        return self.connection.cursor()
    
    def __exit__( self, type, value, traceback) :
        self.connection.commit()
        self.connection.close()

if __name__ == "__main__":
    buildDatabase( "../database/firewall.db", "../database/dbstructure.sql" )