class D3Map {
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;
        this.points = [];
        this.events = {
            move: ()=>{}
        }

        this.cfg = {
            'margin': {'top': 0, 'right': 0, 'bottom': 0, 'left': 0},
            'lat': 0,
            'lng': 0,
            'zoom': 16,
            'circlesize': 12,
            'tileprovider': 'CartoDB.Positron',
        };
        Object.keys(config).forEach(function(key) {
            if(config[key] instanceof Object && config[key] instanceof Array === false){
                Object.keys(config[key]).forEach(function(sk) {
                    self.cfg[key][sk] = config[key][sk];
                });
            } else self.cfg[key] = config[key];
        });

        this.cfg.width = parseInt(this.selection.node().offsetWidth) - this.cfg.margin.left - this.cfg.margin.right,
        this.cfg.height = parseInt(this.selection.node().offsetHeight)- this.cfg.margin.top - this.cfg.margin.bottom;


        this.initGraph();

    }

    initGraph() {
        var self = this;

        this.map = L.map('map')
            .setView([self.cfg.lat,self.cfg.lng], self.cfg.zoom);

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

        L.tileLayer.provider(self.cfg.tileprovider).addTo(this.map);
        this.map._initPathRoot()    

        this.svg = this.selection.append("svg");
        this.g = this.svg.append("g");

    }

    fitBounds(zoombounds, options={}){
        this.map.fitBounds(zoombounds, options)
    }

    on(listener, fn){
        this.events[listener] = fn;
    }
}