from enum import Enum
import re

class Patterns( Enum ):
  PORTS    = re.compile( "^(0|[1-9][0-9]{0,3}|[1-5][0-9]{4}|6([0-4][0-9]{3}|5([0-4][0-9]{2}|5([0-2][0-9]|3[0-5]))))(,(0|[1-9][0-9]{0,3}|[1-5][0-9]{4}|6([0-4][0-9]{3}|5([0-4][0-9]{2}|5([0-2][0-9]|3[0-5]))))){0,14}$" )
  IP       = re.compile( "^([1-9]?[0-9]|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))(\.([1-9]?[0-9]|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))){3}((:([1-9]?[0-9]|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))(\.([1-9]?[0-9]|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))){3})|\/([1-2]?[0-9]|3[0-2]))?$" )
  BITMASK  = re.compile( "^[0-7]$" )
  COMMENTS = re.compile( "^$" )
  COMMA    = re.compile( "," )

def isValidRule( rules ):  
  for rule in rules:
    if Patterns.PORTS.value.search( rule['ports'] ) is None:
      return False
    if Patterns.IP.value.search( rule['ip_from'] ) is None:
      return False
    if Patterns.IP.value.search( rule['ip_to'] ) is None:
      return False
    if Patterns.BITMASK.value.search( str( rule['directions'].value ) ) is None:
      return False 
    if Patterns.BITMASK.value.search( str( rule['protocols'].value ) ) is None:
      return False     
  return True

if __name__ == "__main__":
  print( Patterns.PORTS.value )
