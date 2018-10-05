class D3MapPolygonEdit extends D3MapPolygon {

    constructor(selection, data, config = {}) {
        super(selection, data, config)

        this.loadEditor()
    }


    loadGeojson(geojson, removePre=true) {
        var self = this;
        var latLong = [];
        geojson.features.forEach(function(currentFeature) {
            if (currentFeature.geometry.type == "Polygon"){
                currentFeature.geometry.coordinates[0].forEach(function(location) {
                    latLong.push([location[1], location[0]]);
                });
                
                self.editableLayers.addLayer(L.polygon(latLong))
                latLong = [];
            }else if (currentFeature.geometry.type == "MultiPolygon"){
                currentFeature.geometry.coordinates[0].forEach(function(locationArray) {
                    locationArray.forEach(function(location) {
                        latLong.push([location[1], location[0]]);
                    });
                    
                    self.editableLayers.addLayer(L.polygon(latLong))
                    latLong = [];
                });
                
            }
        });

    }

    loadEditor(){
        var self = this;
        this.editableLayers = new L.FeatureGroup();
        this.map.addLayer(this.editableLayers);

        var drawControl = new L.Control.Draw({
            edit: {
                featureGroup: self.editableLayers,
                poly: {
                    allowIntersection: false
                }

            },
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true
                },
                circle: false,
                marker: false,
                polyline: false,
                rectangle: false,
            }
        });

        this.map.addControl(drawControl);

        this.map.on(L.Draw.Event.CREATED, function (event) {
            console.log('created');
            self.editableLayers.addLayer(event.layer);
        });

        this.map.on(L.Draw.Event.EDITED, function (event) {
            console.log('edited');
        });
    }

    getGeojson(){
        return this.editableLayers.toGeoJSON()
    }

}
