#!/usr/bin/perl
# localRead_TileList.pl
# Author: Justin Jones, 2012
#
# Released into the Public Domain.
#
#
# USE:
# cd tiles_top_directory  
# ls */*/* | sort -n | ./localRead_TileList.pl >localtiles.js 
#
#
# note: Feel free to leave out the 'sort -n' command. Doing so should only result 
#       in a very slightly less efficient object created in rare cases.
#       sort -n does so numerically.  ls will sort alphabetically resulting in split groupings at 9, 99, 999, etc..
# i.e.  ls */*/* | ./localRead_TileList.pl >localtiles.js 
#
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
#  Tested for 4k definition file.
#

use strict;

my $line = <>;
my @numarray = ( $line =~ m/(\d+)/g);
my @last = @numarray;

my $z = 0;
print "localtiles = {"; 
while ( !eof){
    dz($z);
    $z++;
}
print "};"; 


sub dz{
  my $c = 0;
  print "," if $_[0]>0;
  print "$numarray[0]:{\n";
  do{
    dx($c);
    $c++;
  }while( $numarray[0] == $last[0] );
  print "}";
}


sub dx{
  my $c = 0;
  print "," if $_[0]>0;
  print "$numarray[1]:["; 
  do{
    dy($c);
    $c++;
  }while( $numarray[1] == $last[1] );
  print "]\n";
}


sub dy{
  print "," if $_[0]>0;
  print "[$numarray[2]";
  do{
      #print "\t\t\t\t$line";

      @last = @numarray;

      $line = <>;
      @numarray = ( $line =~ m/(\d+)/g);
  }while( !eof && $numarray[2] == 1+$last[2] );
  print ",$last[2]]";


}
