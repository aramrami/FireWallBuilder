from enum import Flag, auto

def mapJsonToRule( data ):
  directionMask = 0
  protocolMask = 0
  print( data )
  rules = [ Rule( rule["direction"], rule["protocol"], rule["ipFrom"], rule["ipTo"], rule["ports"], rule["comment"] ) for rule in data ]
  for rule in rules:
    for command in rule.toCommandString():      
      print( command )

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

class Rule:

  def __init__( self, directions, protocols, ip_from, ip_to, ports, comment ):
    self.directions = Direction.build( directions )
    self.protocols  = Protocol.build( protocols )
    self.ip_from    = ip_from
    self.ip_to      = ip_to
    self.comment    = comment
    self.ports      = ports

  def toCommandString( self ):
    command = "$%s%s %s %s"
    for p_flag in self.protocols.toCommandString():
      for d_flag in self.directions.toCommandString():
        yield command % ( d_flag, p_flag, self.ip_from, self.ip_to )

if __name__ == "__main__":
  r = Rule( 7, 7, None, None, None, None )
  for command in r.toCommandString():
    print( command )
