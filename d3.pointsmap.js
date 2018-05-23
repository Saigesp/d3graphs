class PointsMap {
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;
        this.points = [];
        this.circles = {};
        
        this.cfg = {
            'margin': {'top': 10, 'right': 10, 'bottom': 10, 'left': 40},
            'lat': 0,
            'lng': 0,
            'zoom': 16,
            'circlesize': 12,
        };
        this.cfg.width = parseInt(this.selection.style('width')) - this.cfg.margin.left - this.cfg.margin.right,
        this.cfg.height = parseInt(this.selection.style('height'))- this.cfg.margin.top - this.cfg.margin.bottom;

        Object.keys(config).forEach(function(key) {
            if(config[key] instanceof Object && config[key] instanceof Array === false){
                Object.keys(config[key]).forEach(function(sk) {
                    self.cfg[key][sk] = config[key][sk];
                });
            } else self.cfg[    key] = config[key];
        });

        var max = d3.max(this.data, function(d) { return d.reviews })

        this.colorScale = d3.scaleSequential(d3.interpolateViridis)
            //.domain([0 , 300]);

        this.initGraph();


    }

    initGraph() {
        var self = this;

        this.map = L.map('map')
            .setView([self.cfg.lat,self.cfg.lng], self.cfg.zoom);

        this.mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        
        L.tileLayer(
            "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
        });

        L.tileLayer.provider('CartoDB.PositronNoLabels').addTo(this.map);
        this.map._initPathRoot()    

        this.svg = this.selection.append("svg");
        this.g = this.svg.append("g");

        if(this.data.length > 0){
            this.loadPoints(this.data)
        }
    }

    loadPoints(points){
        var self = this;
        var tdata = {};

        this.colorScale.domain([0 , d3.mean(points, (d)=>{ return d.reviews })*2]);

        // comprobamos puntos locales
        self.data.forEach(function(d){
            if(points.indexOf(d) === -1){
                // punto local NO existe en remoto -> borramos
                self.map.removeLayer(self.circles[d.id])
                delete self.circles[d.id]
            }else{
                // punto local SI existe en remoto -> guardamos
                tdata[d.id] = d
            }
        });


        // comprobamos datos remotos
        points.forEach(function(d){

            // punto remoto no existe en local -> creamos
            if(self.data.indexOf(d) === -1){
                // puntos a crear
                var lnglat = new L.LatLng(+d.latitude, +d.longitude);
                var circle = new L.circle((lnglat), self.cfg.circlesize, {
                    color: self.colorScale(+d.reviews),
                    opacity:1,
                    fillOpacity:.5,
                    className: 'point id-'+d.id,
                })
                circle.addTo(self.map)
                self.circles[d.id] = circle
                tdata[d.id] = d
            }
        })

        self.data = []
        for (var property in tdata) {
            if (tdata.hasOwnProperty(property)) {
                self.data.push(tdata[property])
            }
        }

    }
}
