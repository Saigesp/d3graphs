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
            .attr("height", self.cfg.height)
            .style('overflow','visible');

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

function gmap_scale(zoom){
    var s = {
        20 :      1128.497220,
        19 :      2256.994440,
        18 :      4513.988880,
        17 :      9027.977761,
        16 :     18055.955520,
        15 :     36111.911040,
        14 :     72223.822090,
        13 :    144447.644200,
        12 :    288895.288400,
        11 :    577790.576700,
        10 :   1155581.153000,
         9 :   2311162.307000,
         8 :   4622324.614000,
         7 :   9244649.227000,
         6 :  18489298.450000,
         5 :  36978596.910000,
         4 :  73957193.820000,
         3 : 147914387.600000,
         2 : 295828775.300000,
         1 : 591657550.500000,
    }

    return s[zoom];
}