#!/usr/bin/perl
# localRead_TileList.pl
# Author: Justin Jones, 2012, 2013
#
# Released into the Public Domain.
#
#
# USE:
#
# From directory containing tile directory heiarchy:
#  localRead_TileList.pl >localtiles.js 
#or
#  perl localRead_TileList.pl >localtiles.js 
#
#
# Output:
#  results in a javascript object definition string:
#  eg.
#  localtiles =  {14:{234:[[200,201],[425,425],[678,678],[1025,1027]]}}
#
#
#  Consider including the resulting file in your javascript like this:
#          <script type="text/javascript" src="tiles/localtiles.js"></script>
#
#
#

use strict;
use warnings;

my @tiles;
my @files = glob("*/*/*.png");
foreach my $file (@files) {
        if($file =~ m/(\d+)\D+(\d+)\D+(\d+)\.png/){	  
	  push @tiles,[$1,$2,$3];
        }
    }
    
my @mysorted = sort { $a->[0] <=> $b->[0] || $a->[1] <=> $b->[1]  || $a->[2] <=> $b->[2]    } @tiles;  

# Now have sorted array of arrays of [z,x,y]


my $workingline = 0;
my $numarray = $mysorted[$workingline++];
my $last = $numarray;




my $z = 0;
print "localtiles = {"; 
while ( $workingline < $#mysorted ){
    dz($z);
    $z++;
}
print "};\n"; 


sub dz{
  my $c = 0;
  print "," if $_[0]>0;								# ,
  print "$numarray->[0]:{\n";							# start z
  do{
    dx($c);									# 	within same dz keep calling dx
    $c++;
  }while( $workingline <= $#mysorted && $numarray->[0] == $last->[0] );
  print "}";									# end dz
}



sub dx{		
  my $c = 0;
  print "," if $_[0]>0;								# ,
  print "$numarray->[1]:["; 							#start x
  do{
    dy($c);									# within same dx keep calling dy
    $c++;
  }while( $workingline <= $#mysorted && $numarray->[1] == $last->[1] );
  print "]\n";									# end dx
}



sub dy{
  print "," if $_[0]>0;								# ,
  print "[$numarray->[2]";							# start y
  do{
      $last = $numarray;
      $numarray = $mysorted[$workingline++];
  }while( $workingline <= $#mysorted && $numarray->[2] == 1+$last->[2] );	# within consecutive dy's - find edges
  
  # watch out for last record special case:
  if(  $workingline <= $#mysorted ){  	print ",$last->[2]]" 		}	# end y
  else {  				print ",$numarray->[2]]"	};

}
