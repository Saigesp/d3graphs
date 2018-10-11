class StripeLines{
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 30, 'right': 70, 'bottom': 36, 'left': 10},
            'key': 'key',
            'colorScale': d3.interpolateRdBu,
            'label': false,
            'label_x': 35,
            'label_y': 14,
            'units': 'ºC',
            'legendRanges': false, // [13,14,15,16]
            'title': false,
            'source': false,
        };

        this.cfg.width = parseInt(this.selection.node().offsetWidth) - this.cfg.margin.left - this.cfg.margin.right,
        this.cfg.height = parseInt(this.selection.node().offsetHeight)- this.cfg.margin.top - this.cfg.margin.bottom;

        Object.keys(config).forEach(function(key) {
            if(config[key] instanceof Object && config[key] instanceof Array === false){
                Object.keys(config[key]).forEach(function(sk) {
                    self.cfg[key][sk] = config[key][sk];
                });
            } else self.cfg[key] = config[key];
        });

        this.parseTime = d3.timeParse("%Y");
        this.data.forEach(function(d) {
            d.date = self.parseTime(d[self.cfg.label]);
        });

        this.xScale = d3.scaleLinear().rangeRound([0, self.cfg.width]);
        this.cScale = d3.scaleSequential(this.cfg.colorScale);

        this.initGraph();
    }

    initGraph() {
        var self = this;

        this.cScale.domain(d3.extent(this.data, function(d){ return +d[self.cfg.key]}).reverse())
        if(self.cfg.label) this.xScale.domain(d3.extent(this.data, function(d){ return d.date }))

        this.svg = this.selection.append('svg')
            .attr("class", "chart barchar stackedbarchart")
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        if(self.cfg.label){
            this.g.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + this.cfg.height + ")")
                .call(d3.axisBottom(self.xScale)
                    .ticks(10)
                    .tickFormat(d3.timeFormat("%Y")));
        }

        this.itemg = this.g.selectAll('.itemgroup')
            .data(this.data)
            .enter().append('g')
            .attr('class', 'itemgroup')
            .attr('transform', function(d, i){
                return 'translate('+ i*(self.cfg.width/self.data.length) +',0)';
        })
                
        this.bars = this.itemg.append('rect')
            .attr('height', self.cfg.height)
            .attr('width', (self.cfg.width/self.data.length) +1)
            .attr('fill', function(d) {
                return self.cScale(+d[self.cfg.key]);
            })

        // Title
        if(self.cfg.title){
            this.svg.append('text')
                .attr('class', 'title label')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate('+ (self.cfg.width/2) +',20)')
                .text(self.cfg.title)
        }

        // Source
        if(self.cfg.source){
            this.svg.append('text')
                .attr('class', 'source label')
                .attr('transform', 'translate('+ (self.cfg.margin.left) +','+(self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom - 5)+')')
                .text(self.cfg.source)

        }

        // Label
        if(self.cfg.label){
            this.itemg.append('text')
                .attr('class', 'label')
                .attr('text-anchor', 'start')
                .attr('transform', 'rotate(270)')
                .attr('x', -this.cfg.height + this.cfg.label_x)
                .attr('y', this.cfg.label_y)
                .text(function(d){
                    return d[self.cfg.key] +' '+self.cfg.units+ ' - ' + d[self.cfg.label];
                })
        }

        //Legend 
        if(self.cfg.legendRanges instanceof Array === true){
            this.legend = this.g.append('g')
                .attr('class', 'legend')
                .attr('transform', 'translate('+ (self.cfg.width + 10) +',30)');

            [16,15,14,13].forEach(function(d, i){
                var tm = self.legend.append('g')
                    .attr('transform', 'translate(0,'+(i*((self.cfg.width/self.data.length)+6))+')')

                tm.append('rect')
                    .attr('width', self.cfg.width/self.data.length)
                    .attr('height', self.cfg.width/self.data.length)
                    .attr('fill', self.cScale(d))

                tm.append('text')
                    .attr('transform', 'translate('+((self.cfg.width/self.data.length)+4)+','+((self.cfg.width/self.data.length)-4)+')')
                    .attr('class', 'label')
                    .text(d + ' ' + self.cfg.units)
            })
        }

    }
}