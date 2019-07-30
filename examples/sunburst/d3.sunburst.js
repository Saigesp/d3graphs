class SunBurst{
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 30, 'right': 70, 'bottom': 36, 'left': 10},
            'key': 'name',
            'value': 'value',
            //'colorScale': d3.interpolateRdBu,
            //'label': false,
            //'label_x': 35,
            //'label_y': 14,
            //'units': 'ºC',
            //'legendRanges': false, // [13,14,15,16]
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

        let radius = Math.min(this.cfg.width, this.cfg.height)/2;

        this.xScale = d3.scaleLinear()
            .range([0, 2 * Math.PI])
            .clamp(true);

        this.yScale = d3.scaleSqrt()
            .range([radius*.1, radius]);

        this.arc = d3.arc()
            .startAngle(function(d){ return self.xScale(d.x0)})
            .endAngle(function(d){ return self.xScale(d.x1)})
            .innerRadius(function(d){ return Math.max(0, self.yScale(d.y0))})
            .outerRadius(function(d){ return Math.max(0, self.yScale(d.y1))});

        this.middleArcLine = function(d){
            let angles = [self.xScale(d.x0) - (Math.PI/2), self.xScale(d.x1) - (Math.PI/2)];
            let r = Math.max(0, (self.yScale(d.y0) + self.yScale(d.y1)) / 2);

            const middleAngle = (angles[1] + angles[0]) / 2;
            const invertDirection = middleAngle > 0 && middleAngle < Math.PI; // On lower quadrants write text ccw
            if (invertDirection) { angles.reverse(); }

            const path = d3.path();
            path.arc(0, 0, r, angles[0], angles[1], invertDirection);
            return path.toString();
        }

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

        this.cg = this.g.append("g")
            .attr("transform", "translate(" + (self.cfg.width/2) + "," + (self.cfg.height/2) + ")");




        let partition = d3.partition();

        let root = d3.hierarchy(this.data);
        root.sum(function(d){
            return d[self.cfg.value];
        });

        let slice = this.cg.selectAll('g.slice')
            .data(partition(root).descendants());

        slice.exit().remove();


        let newSlice = slice.enter()
            .append('g').attr('class', 'slice')
            .on('click', d => {
                d3.event.stopPropagation();
                //focusOn(d);
            });

        newSlice.append('title')
            .text(function(d){
                return d.data.name
            });

        newSlice.append('path')
            .attr('class', 'main-arc')
            .style('fill', function(d){
                return 'steelblue';
            })
            .attr('d', this.arc);

        newSlice.append('path')
            .attr('class', 'hidden-arc')
            .attr('fill', 'transparent')
            //.attr('id', (_, i) => `hiddenArc${i}`)
            .attr('d', this.middleArcLine);

    }
}