from enum import Enum

class Patterns( Enum ):
  PORTS    = "^[1-9][0-9]{0,4}(,[1-9][0-9]{0,4})*$"
  IP       = "^([1-9][0-9]?|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))(\.([1-9][0-9]?|1[0-9][0-9]|2([0-4][0-9]|5[0-5]))){3}$"
  BITMASK  = "^[0-7]$"
  COMMENTS = "^$"

if __name__ == "__main__":
  print( Patterns.PORTS.value )
