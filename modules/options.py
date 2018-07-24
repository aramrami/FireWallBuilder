from enum import Flag, auto
from modules.sanitizer import Patterns
import json

def mapJsonToRule( data ):
  rules = [ Rule( rule["direction"], rule["protocol"], rule["ipFrom"], rule["ipTo"], rule["ports"], rule["comment"] ) for rule in data ]
  return rules

class Direction( Flag ):
  NONE    = 0
  FORWARD = auto()
  INPUT   = auto()
  OUTPUT  = auto()

  def toCommandString( self ):
    if self & Direction.FORWARD is Direction.FORWARD:
      yield "F"
    if self & Direction.INPUT is Direction.INPUT:
      yield "I"
    if self & Direction.OUTPUT is Direction.OUTPUT:
      yield "O"

  def getBitmask( self ):
    bitmask = 0
    if Direction.FORWARD & self == Direction.FORWARD:
      bitmask += 1
    if Direction.INPUT & self == Direction.INPUT:
      bitmask += 2
    if Direction.OUTPUT & self == Direction.OUTPUT:
      bitmask += 4 
    return bitmask

  @staticmethod
  def build( number ):
    direction = Direction.NONE
    if Direction.FORWARD.value & number == Direction.FORWARD.value:
      direction |= Direction.FORWARD
    if Direction.INPUT.value & number == Direction.INPUT.value:
      direction |= Direction.INPUT
    if Direction.OUTPUT.value & number == Direction.OUTPUT.value:
      direction |= Direction.OUTPUT
    return direction

class Protocol( Flag ):
  NONE = 0
  TCP  = auto()
  UDP  = auto()
  ICMP = auto()

  def toCommandString( self ):
    if self & Protocol.TCP is Protocol.TCP:
      yield "T"
    if self & Protocol.UDP is Protocol.UDP:
      yield "U"
    if self & Protocol.ICMP is Protocol.ICMP:
      yield "I"

  def getBitmask( self ):
    bitmask = 0
    if Protocol.TCP & self == Protocol.TCP:
      bitmask += 1
    if Protocol.UDP & self == Protocol.UDP:
      bitmask += 2
    if Protocol.ICMP & self == Protocol.ICMP:
      bitmask += 4
    return bitmask

  @staticmethod
  def build( number ):
    protocol = Protocol.NONE
    if Protocol.TCP.value & number == Protocol.TCP.value:
      protocol |= Protocol.TCP
    if Protocol.UDP.value & number == Protocol.UDP.value:
      protocol |= Protocol.UDP
    if Protocol.ICMP.value & number == Protocol.ICMP.value:
      protocol |= Protocol.ICMP
    return protocol

class Rule( dict ):

  def __init__( self, directions, protocols, ip_from, ip_to, ports, comment ):
    dict.__init__( self, directions=Direction.build( directions ), protocols=Protocol.build( protocols ), ip_from=ip_from, ip_to=ip_to, ports=ports, comment=comment )
    #self.directions = Direction.build( directions )
    #self.protocols  = Protocol.build( protocols )
    #self.ip_from    = ip_from
    #self.ip_to      = ip_to
    #self.comment    = comment
    #self.ports      = ports

  def toCommandString( self ):
    multiport = ""
    dport     = "dport"
    command   = "$%s%s %s -s %s -d %s --%s %s $R\n"
    
    if Patterns.COMMA.value.search( self['ports'] ):
      multiport = "$MP"
      dport     = "dports"
    
    for p_flag in self['protocols'].toCommandString():
      for d_flag in self['directions'].toCommandString():
        yield command % ( d_flag, p_flag, multiport, self['ip_from'], self['ip_to'], dport, self['ports'] )

  def insert( self, firewallID, cursor ):
    cursor.execute( "INSERT INTO Rules (directionBitmask,protocolBitmask,ipFrom,ipTo,ports,comment,firewallID) VALUES (?,?,?,?,?,?,?)", ( self['directions'].getBitmask(), self['protocols'].getBitmask(), self['ip_from'], self['ip_to'], self['ports'], self['comment'], firewallID ) )

  def __str__( self ):
    output = "# %s\n" % self['comment']
    for command in self.toCommandString():
      output += command
    return output

class Firewall( dict ):
  
  def __init__( self, title, creationDate, rules, id=0 ):
    dict.__init__( self, title=title, creationDate=creationDate, rules=rules, id=id )
    #self.title        = None
    #self.creationDate = None
    #self.rules        = rules
  
  def insert( self, cursor ):
    cursor.execute( "INSERT INTO Firewalls (title,creationDate) VALUES (?,?);", ( self['title'], self['creationDate'] ) )
    cursor.execute( "SELECT MAX(firewallID) FROM Firewalls;" )
    currentID = cursor.fetchone()[0]
    for rule in self['rules']:
      rule.insert( currentID, cursor )
  
  def toJSON( self ):
    return json.dumps( self, default=lambda obj: obj.__dict__, sort_keys=True, indent=4 )
  
  def fetchRules( self, cursor ):
    cursor.execute( "SELECT * FROM Rules WHERE firewallID = ?;", ( self['id'], ) )
    for row in cursor:
      self['rules'].append( Rule( row[1], row[2], row[3], row[4], row[5], row[6] ) )
  
  @staticmethod
  def fetchAll( cursor ):
    firewalls = []
    cursor.execute( "SELECT * FROM Firewalls;" )
    for row in cursor:
      firewalls.append( Firewall( row[1], row[2], [], id=row[0] ) )
    return firewalls
  
def loadTemplate( url ):
  buffer = ""
  with open( url, "r" ) as file:
    for line in file:
      buffer += line
  return buffer

def buildFirewall( rules ):
  prefix = loadTemplate( "./modules/prefix.fw" )
  suffix = loadTemplate( "./modules/suffix.fw" )
  custom = ""
  for rule in rules:
    custom += rule.__str__()
  return "%s\n%s\n%s" % ( prefix, custom, suffix )

if __name__ == "__main__":
  t = Direction.INPUT | Direction.OUTPUT | Direction.FORWARD
  print( t.getBitmask() )
