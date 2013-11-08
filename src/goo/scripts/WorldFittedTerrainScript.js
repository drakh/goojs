define([
	'goo/scripts/HeightMapBoundingScript'
	],
	function(HeightMapBoundingScript) {
		"use strict";

		var _defaults = {
			minX: 0,
			maxX: 100,
			minY: 0,
			maxY: 50,
			minZ: 0,
			maxZ: 100
		};

		function validateTerrainProperties(properties, heightMatrix, heightMapData) {
			if (properties.minX > properties.maxX) {
				throw { name: "Terrain Exception", message: "minX is larger than maxX" };
			}
			if (properties.minY > properties.maxY) {
				throw { name: "Terrain Exception", message: "minY is larger than maxY" };
			}
			if (properties.minZ > properties.maxZ) {
				throw { name: "Terrain Exception", message: "minZ is larger than maxZ" };
			}
			if (!heightMatrix) {
				throw { name: "Terrain Exception", message: "No heightmap data specified" };
			}
			if (heightMatrix.length !== heightMatrix[0].length) {
				throw { name: "Terrain Exception", message: "Heightmap data is not a square" };
			}

        /*  Write tests for this stuff
            function checkTerrainSpatialConflict(dim) {

            }

            for (var i = 0; i < heightMapData.length; i++) {
                checkTerrainSpatialConflict(heightMapData[i].dimensions)
            }
        */

			return true;
		}




		function registerHeightData(heightMatrix, dimensions, heightMapData) {
			dimensions = dimensions || _defaults;
			validateTerrainProperties(dimensions, heightMatrix, heightMapData);
			var scriptContainer = {
				dimensions:dimensions,
				sideQuadCount:heightMatrix.length-1,
				script: new HeightMapBoundingScript(heightMatrix)
			};
			return scriptContainer;
		}

		/**
		 * @class Creates and exposes a square heightmap terrain fitted within given world dimensions.
         * This does not do any visualizing of the heightMap. That needs to be done elsewhere.
		 * @constructor
		 */

		function WorldFittedTerrainScript() {
			this.heightMapData = [];
            this.yMargin = 1;
		}

		/**
		 * @method Adds a block of height data from an image at given dimensions and stores the script in an array.
		 * @param (String) file to load height data from
		 * @param (Object) dimensions to fit the data within
		 */

		WorldFittedTerrainScript.prototype.addHeightData = function(heightMatrix, dimensions) {
            var scriptContainer = registerHeightData(heightMatrix, dimensions, this.heightMapData)
			this.heightMapData.push(scriptContainer);
            return scriptContainer;
		};

		/**
		 * @method Returns the script relevant to a given position
		 * @param (Array) pos data, typically use entity transform.data
		 * @returns (Object) container object with script and its world dimensions
		 */

		WorldFittedTerrainScript.prototype.getHeightDataForPosition = function(pos) {
			for (var i = 0; i < this.heightMapData.length; i++) {
				var dim = this.heightMapData[i].dimensions;
				if (pos[0] <= dim.maxX && pos[0] >= dim.minX) {
					if (pos[1] < dim.maxY+this.yMargin && pos[1] > dim.minY-this.yMargin) {
						if (pos[2] <= dim.maxZ && pos[2] >= dim.minZ) {
							return this.heightMapData[i];
						}
					}
				}
			}
			return null;
		};

        /**
         * Adjusts coordinates to fit the dimensions of a registered heightMap.
         * @param axPos
         * @param axMin
         * @param axMax
         * @param quadCount
         * @return {Number}
         */

		WorldFittedTerrainScript.prototype.displaceAxisDimensions = function(axPos, axMin, axMax, quadCount) {
			var matrixPos = axPos-axMin;
			return quadCount*matrixPos/(axMax - axMin);
		};

		/**
		 * @method Looks through height data and returns the elevation of the ground at a given position
		 * @param (Array) pos Position as [x, y, z]
		 * @returns (Float) height in units
		 */

		WorldFittedTerrainScript.prototype.getGroundHeightAtPos = function(pos) {
			var heightData = this.getHeightDataForPosition(pos);
			if (heightData === null) {
				return null;
			}
			var dims = heightData.dimensions;

			var tx = this.displaceAxisDimensions(pos[0], dims.minX, dims.maxX, heightData.sideQuadCount);
			var tz = this.displaceAxisDimensions(pos[2], dims.minZ, dims.maxZ, heightData.sideQuadCount);
			var matrixHeight = heightData.script.getInterpolated(tx, tz);
			return matrixHeight*(dims.maxY - dims.minY) + dims.minY;
		};

        WorldFittedTerrainScript.prototype.run = function(entity) {
            var translation = entity.transformComponent.transform.translation;
            var groundHeight = this.getGroundHeightAtPos(translation.data);
            if (groundHeight) {
                translation.data[1] = groundHeight;
            }
        };


        return WorldFittedTerrainScript;

	});

