/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.LocalRead
 * A control for using a subset of local image tiles
 * from the base url otherwise leave at orignal source. 
 * Example use: important/high use tiles stored on app server, others accessed from shared tile server.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 *
 * Called with a parameter object describing which tiles are available locally.
 * Second parameter sets the base tile directory ( i.e. '/home/testing/tiles/' or 'tiles/). 
 */
OpenLayers.Control.LocalRead = OpenLayers.Class(OpenLayers.Control, { 
  
    
    tiles: null,
    prefix: 'xtiles/',
  
    /**
     * APIProperty: fetchEvent
     * {String} The layer event to listen to for replacing remote resource tile
     *     URLs with cached data URIs. Supported values are "tileerror" (try
     *     remote first, fall back to cached) and "tileloadstart" (try cache
     *     first, fall back to remote). Default is "tileloadstart".
     *
     *     Note that "tileerror" will not work for CORS enabled images (see
     *     https://developer.mozilla.org/en/CORS_Enabled_Image), i.e. layers
     *     configured with a <OpenLayers.Tile.Image.crossOriginKeyword> in
     *     <OpenLayers.Layer.Grid.tileOptions>.
     */
    fetchEvent: "tileloadstart",
    
    /**
     * APIProperty: layers
     * {Array(<OpenLayers.Layer.Grid>)}. Optional. If provided, only these
     *     layers will receive tiles from the cache.
     */
    layers: null,
    
    /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map.  Default is
     *     true.
     */
    autoActivate: true,

    /**
     * Constructor: OpenLayers.Control.LocalRead
     *
     * Parameters:
     *  LocalTiles - {Object} Structure containing information on tiles available locally
     *          localTiles[z][x][i][r]   range: r[0] to r[1] inclusive.
     *          i.e. lt[14][234][3][0] = 1025 lt[14][234][3][1] =1027 specifies that 
     *          directory 14/234 has 1025.png, 1026.png and 1027.png 
     *          and is the fourth (i.e. index 3) range found in that directory.
     * 
     *          14/234/200.png
     *          14/234/201.png
     *          14/234/425.png
     *          14/234/678.png
     *          14/234/1025.png
     *          14/234/1026.png
     *          14/234/1027.png
     *          encoded as:
     *          LocalTiles =  {14:{234:[[200,201],[425,425],[678,678],[1025,1027]]}}
     *          which in this rare case is not a space savings.
     *          REFER TO openlayers/tools/localRead_TileList.pl for a helper script to generate this string.
     * 			 consider including it such as this: <script type="text/javascript" src="tiles/localtiles.js"></script>
     * 
     * tileCachePrefix - {string} directory where local tiles are stored. default is 'tiles/'
     */
   
    initialize: function(localTiles, tileCachePrefix, options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]); 
	this.tiles = localTiles;
	this.prefix = tileCachePrefix;
    },
    
    /** 
     * Method: setMap
     * Set the map property for the control. 
     * 
     * Parameters:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        var i, layers = this.layers || map.layers;
        for (i=layers.length-1; i>=0; --i) {
            this.addLayer({layer: layers[i]});
        }
        if (!this.layers) {
            map.events.on({
                addlayer: this.addLayer,
                removeLayer: this.removeLayer,
                scope: this
            });
        }
    },
    
    /**
     * Method: addLayer
     * Adds a layer to the control. Once added, tiles requested for this layer
     *     will be cached.
     *
     * Parameters:
     * evt - {Object} Object with a layer property referencing an
     *     <OpenLayers.Layer> instance
     */
    addLayer: function(evt) {
        evt.layer.events.register(this.fetchEvent, this, this.fetch);        
    },
    
    /**
     * Method: removeLayer
     * Removes a layer from the control. Once removed, tiles requested for this
     *     layer will no longer be cached.
     *
     * Parameters:
     * evt - {Object} Object with a layer property referencing an
     *     <OpenLayers.Layer> instance
     */
    removeLayer: function(evt) {
        evt.layer.events.unregister(this.fetchEvent, this, this.fetch);
    },
    
    
    
    /**
    * Method: checkIfLocalTile
    * Looks into the localtiles object (if available) to see if a given tile is available in local store.
    * 
    * Parameters:
    * z - {Integer} zoom level of tile.
    * x - {Integer} x section of tile.
    * y - {Integer} y section of tile.
    */

    checkIfLocalTile: function(z,x,y){
        var len,i;
        if ( typeof this.tiles !== 'undefined' ){
	    if (typeof this.tiles[z] !== 'undefined' ){
	        if (typeof this.tiles[z][x] !== 'undefined' ){
	            len = this.tiles[z][x].length;
	            for (i = 0; i < len; i++){
	                if( this.tiles[z][x][i][0] <= y && y<= this.tiles[z][x][i][1] ){
        	            return true;
	                }
	            }  
	        }
            }
	}
        return false;
    },
    
    /**
     * Method: setIfLocalURL
     * Calculates the url to access local tile store.
     * If in local store then modify tile's url
     *
     * Parameters:
     * tile - {Object} tile object.
     */
     
     setIfLocalURL: function (tile){

	var xyz = tile.layer.getXYZ(tile.bounds);
  
	if ( this.checkIfLocalTile(xyz.z,xyz.x,xyz.y)){
	    tile.url = this.prefix + xyz.z + "/" + xyz.x + "/" + xyz.y + "." + "png";
        } 
    },


    /**
     * Method: fetch
     * Listener to the <fetchEvent> event. Replaces a tile's url with a data
     * URI from the cache.
     *
     * Parameters:
     * evt - {Object} Event object with a tile property.
     */
    fetch: function(evt) {
        if (this.active && window.localStorage &&
                evt.tile instanceof OpenLayers.Tile.Image) {
            var tile = evt.tile;
	
	
	    this.setIfLocalURL(tile);

        }
    },
    
    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        if (this.layers || this.map) {
            var i, layers = this.layers || this.map.layers;
            for (i=layers.length-1; i>=0; --i) {
                this.removeLayer({layer: layers[i]});
            }
        }
        if (this.map) {
            this.map.events.un({
                addlayer: this.addLayer,
                removeLayer: this.removeLayer,
                scope: this
            });
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },
    
    CLASS_NAME: "OpenLayers.Control.LocalRead"
});
