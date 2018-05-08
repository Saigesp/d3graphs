class FlatMap {
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 10, 'right': 10, 'bottom': 10, 'left': 40},
            'lat': 0,
            'lng': 0,
            'scale': 10000,
            'fill': '#CCCCCC',
            'fillopacity': 0.5,
            'stroke': '#000000',
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

        this.projection = d3.geoMercator()
            .scale(self.cfg.scale)
            .translate([self.cfg.width/2,self.cfg.height/2])
            .center([self.cfg.lng, self.cfg.lat]);
        
        this.path = d3.geoPath().projection(self.projection);　

        this.initGraph();
    }

    initGraph() {
        var self = this;

        this.map = self.selection
            .append("svg")
            .attr("width", self.cfg.width)
            .attr("height", self.cfg.height); 

        this.map.selectAll("path")
            .data(self.data)
            .enter()
            .append("path")
            .attr("d", self.path)
            .attr("fill", self.cfg.fill)
            .attr("fill-opacity", self.cfg.fillopacity)
            .attr("stroke", self.cfg.stroke);    
    }
}