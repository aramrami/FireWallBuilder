from enum import Flag, auto

class Directions( Flag ):
    INPUT   = auto()
    OUTPUT  = auto()
    FORWARD = auto()
    
class Protocolls( Flag ):
    TCP  = auto()
    UDP  = auto()
    ICMP = auto()

class FireWallRule:
    def __init__( self ):
        self.directions = None
        self.protocolls = None
        self.ipFrom = None
        self.ipTo = None
        self.ports = None
        self.comment = None
        
    def toCommandString( self ):
        pass
    
if __name__ == "__main__":
    pass