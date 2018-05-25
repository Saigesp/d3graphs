class D3MapPolygon extends D3Map {

    constructor(selection, data, config = {}) {
        super(selection, data, config)
        this.circles = {};
    }

    loadGeojson(geojson, removePre=true) {
        var self = this;

        if(removePre) this.removeGeojsons()

        this.geojsonLayer = L.geoJson(geojson, {
            onEachFeature: function(feature, layer) { },
            style: function(d) {
                return {
                    'weight':'2px',
                    'color':'#000000',
                    'fillColor': 'trasparent',
                    'fillOpacity': 0
                };
            }
        }).addTo(this.map);

    }

    removeGeojsons() {
        if(this.geojsonLayer){
            this.map.removeLayer(this.geojsonLayer);
        }
    }

    loadPoints(points){
        var self = this;
        self.points = points;
        
        self.circles[points[0].id.slice(0,6)] = []

        self.points.forEach(function(d){
            var lnglat = new L.LatLng(+d.latitude, +d.longitude);
            var circle = new L.circle((lnglat), 5, {
                opacity:.8,
                fillOpacity:0.2,
                className: "point " +d.id.slice(0,6),
            })
            self.circles[d.id.slice(0,6)].push(circle)
            circle.addTo(self.map)
        });

    }

    removePoints(platform) {
        var self = this;
        self.circles[platform].forEach(function(item){
            self.map.removeLayer(item)
        })
    }

}
