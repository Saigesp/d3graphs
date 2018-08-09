class StripeLines{
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 10, 'right': 10, 'bottom': 10, 'left': 40},
            'key': 'key',
            'colorScale': d3.interpolateRdBu,
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

        this.cfg.separation = this.cfg.width / this.data.length;

        this.cScale = d3.scaleSequential(this.cfg.colorScale);

        this.initGraph();
    }

    initGraph() {
        var self = this;

        this.cScale.domain(d3.extent(this.data, function(d){ return +d[self.cfg.key]}).reverse())

        this.svg = this.selection.append('svg')
            .attr("class", "chart barchar stackedbarchart")
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        this.itemg = this.g.selectAll('.itemgroup')
            .data(this.data)
            .enter().append('g')
            .attr('class', 'itemgroup')
            .attr('transform', function(d, i){
                return 'translate('+(i*self.cfg.separation)+',0)';
        })
                
        this.bars = this.itemg.append('rect')
            .attr('height', self.cfg.height)
            .attr('width', self.cfg.separation +1)
            .attr('fill', function(d) {
                return self.cScale(+d[self.cfg.key]);
            })

    }
}