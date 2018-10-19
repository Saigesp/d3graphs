class PieChart{

    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 50, 'right': 30, 'bottom': 50, 'left': 30},
            'key': 'key',
            'label': 'label',
            'colors': ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
            'radius': false,
            'innerradius': 0,
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

        this.cfg.radius = this.cfg.radius ? this.cfg.radius : Math.min(this.cfg.width, this.cfg.height) / 2;
        this.cScale = d3.scaleOrdinal().range(this.cfg.colors);
        this.arc = d3.arc().outerRadius(this.cfg.radius).innerRadius(this.cfg.innerradius);
        this.outerArc = d3.arc().outerRadius(this.cfg.radius*1.1).innerRadius(this.cfg.radius*1.1);

        this.pie = d3.pie().sort(null).value(function(d) { return d[self.cfg.key]; });

        this.initGraph();

    }

    initGraph() {
        let self = this;

        this.svg = this.selection.append('svg')
            .attr("class", "chart barchart")
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        this.itemg = this.g.selectAll('.itemg')
            .data(this.pie(self.data))
            .enter().append('g')
            .attr("transform", "translate(" + (self.cfg.width/2) + "," + (self.cfg.height/2) + ")")
            .attr("class", "itemg")

        // PATHS
        this.itemg.append("path")
            .attr("d", this.arc)
            .style("fill", function(d) { return self.cScale(d.data[self.cfg.key]); });


        // LABELS
        this.itemg.append('text')
            .attr("class", "label")
            .attr("transform", function(d){
                var pos = self.outerArc.centroid(d);
                pos[0] = self.cfg.radius * (self.midAngle(d) < Math.PI ? 1.1 : -1.1);
                return "translate("+pos+")";
            })
            .attr('text-anchor', function(d){
                return self.midAngle(d) < Math.PI ? 'start' : 'end';
            })
            .text(function(d){
                return d.data[self.cfg.label];
            })


        // LINES
        this.itemg.append('polyline')
            .attr("class", "line line-label")
            .attr('points', function(d){
                var pos = self.outerArc.centroid(d);
                pos[0] = self.cfg.radius * 0.95 * (self.midAngle(d) < Math.PI ? 1.1 : -1.1);
                return [self.arc.centroid(d), self.outerArc.centroid(d), pos]
            })

    }

    midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

}