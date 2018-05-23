class PolygonMapEdit {
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;
        this.points = [];
        this.events = {
            move: ()=>{}
        }

        this.cfg = {
            'margin': {'top': 10, 'right': 10, 'bottom': 10, 'left': 40},
            'lat': 0,
            'lng': 0,
            'zoom': 16,
        };
        this.cfg.width = parseInt(this.selection.style('width')) - this.cfg.margin.left - this.cfg.margin.right,
        this.cfg.height = parseInt(this.selection.style('height'))- this.cfg.margin.top - this.cfg.margin.bottom;

        Object.keys(config).forEach(function(key) {
            if(config[key] instanceof Object && config[key] instanceof Array === false){
                Object.keys(config[key]).forEach(function(sk) {
                    self.cfg[key][sk] = config[key][sk];
                });
            } else self.cfg[key] = config[key];
        });

        this.initGraph();

    }

    initGraph() {
        var self = this;

        this.map = L.map('map')
            .setView([self.cfg.lat,self.cfg.lng], self.cfg.zoom);

        this.mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';

        this.map.on("moveend", ()=>{
            this.events.move({
                lat: this.map.getCenter().lat,
                lng: this.map.getCenter().lng,
                zoom: this.map.getZoom()
            })
        });
        
        L.tileLayer(
            "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
        });

        L.tileLayer.provider('CartoDB.Positron').addTo(this.map);
        this.map._initPathRoot()    

        this.svg = this.selection.append("svg");
        this.g = this.svg.append("g");

    }

    loadGeojson(geojson) {
        var self = this;

        this.removeGeojsons()

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

    fitinBounds(zoombounds, options={}){
        this.map.fitBounds(zoombounds, options)
    }

    on(listener, fn){
        console.log('on in');
        this.events[listener] = fn;
    }

}
