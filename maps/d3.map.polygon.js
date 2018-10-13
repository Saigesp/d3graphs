class D3MapPolygon extends D3Map {

    constructor(selection, data, config = {}) {
        super(selection, data, config)
        this.circles = {};
    }

    loadGeojson(geojson, removePre=true) {
        var self = this;
        this.geojson = geojson

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

    fitGeojson(geojson=this.geojson){
        var bounds = this.getGeojsonBounds(geojson)
        var zoombounds = L.latLngBounds(bounds[0], bounds[1]);
        this.fitBounds(zoombounds, {animate: true})
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

    getGeojsonBounds(geojson){
        var all = [[180,90],[-180,-90]]

        function iLl(ll){
            for(let i = 0; i<2; i++){
                if(ll[i] < all[0][i]) all[0][i] = ll[i];
                if(ll[i] > all[1][i]) all[1][i] = ll[i];
            }
        }
        function iPl(pl){ pl.forEach((ll)=>{ iLl(ll) }) }
        function iPls(pls){ pls.forEach((pl)=>{ iPl(pl) }) }
        function iMpls(mpls){ mpls.forEach((pls)=>{ iPls(pls) }) }
        function iFs(fts){
            fts.forEach((ft)=>{
                ft.geometry.coordinates.forEach((pls)=>{
                    pls.forEach((pl)=>{
                        if(ft.geometry.type=='MultiPolygon') iPl(pl)
                        else iLl(pl)
                    })
                })
            })
        }

        if (geojson.type == 'FeatureCollection'){
            iFs(geojson.features)

        } else if (geojson.type == 'MultiPolygon'){
            iMpls(geojson.coordinates)

        }else if(geojson.type == 'Polygon'){
            iPls(geojson.coordinates)
        }

        return [[all[0][1],all[0][0]], [all[1][1],all[1][0]]]
    }

}
