class MeanBarChart{

    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            margin: {top: 40, right: 30, bottom: 50, left: 40},
            key: 'key',
            label: 'date',
            colors: ['#95bd95', '#db8c8c'],
            greycolor: '#CCC',
            yscaleformat: '.0f',
            currentkey: false,
            title: false,
            source: false,
            mean: false,
            meanlabel: false,
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

        this.xScale = d3.scaleBand().rangeRound([0, this.cfg.width]).padding(0.1);
        this.yScale = d3.scaleLinear().rangeRound([0, self.cfg.height]);

        window.addEventListener("resize", function(){self.resize()});

        this.initGraph();
    }
    initGraph() {
        var self = this;

        this.xScale.domain(this.data.map(function(d) { return d[self.cfg.label]; }));
        this.yScale.domain([d3.max(this.data, function(d){ return +d[self.cfg.key]}),d3.min(this.data, function(d){ return +d[self.cfg.key]})])

        this.svg = this.selection.append('svg')
            .attr("class", "chart barchart")
            //.attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        // TITLE
        if(self.cfg.title){
            this.title = this.svg.append('text')
                .attr('class', 'title label')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate('+ (self.cfg.width/2) +',20)')
                .text(self.cfg.title)
        }

        // SOURCE
        if(self.cfg.source){
            this.source = this.svg.append('text')
                .attr('class', 'source label')
                .attr('transform', 'translate('+ (self.cfg.margin.left) +','+(self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom - 5)+')')
                .html(self.cfg.source)
        }

        // GRID
        this.yGrid = this.g.append("g")           
            .attr("class", "grid grid--y")
            .call(self.make_y_gridlines()
                .tickSize(-self.cfg.width)
                .ticks(5, self.cfg.yscaleformat));

        this.itemg = this.g.selectAll('.itemgroup')
            .data(this.data)
            .enter().append('g')
            .attr('class', 'itemgroup')
            .attr('transform', function(d, i){
                return 'translate('+ self.xScale(d[self.cfg.label]) +',0)';
        })

        this.rects = this.itemg.append('rect')
            .attr('x', 0)
            .attr('y', function(d, i){
                return +d[self.cfg.key] < 0 ? self.yScale(0) : self.yScale(+d[self.cfg.key]);
            })
            .attr('width', this.xScale.bandwidth())
            .attr('height', function(d){
                return +d[self.cfg.key] < 0 ? self.yScale(+d[self.cfg.key]) - self.yScale(0) : self.yScale(0) - self.yScale(+d[self.cfg.key]);
            })
            .attr('fill', function(d){
                var c = +d[self.cfg.key] < 0 ? 1 : 0;
                return !self.cfg.currentkey || d[self.cfg.key] == self.cfg.currentkey ? self.cfg.colors[c] : self.cfg.greycolor;
            });

        this.rects.append("title")
            .text(function(d) { return d[self.cfg.key]});

        // AXIS
        this.xAxis = this.g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.yScale(0) + ")")

        this.xAxisLine = this.xAxis.append('line')
            .attr('stroke', 'black')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', this.cfg.width)
            .attr('y2', 0)

        this.xAxisLabels = this.xAxis.selectAll('text')
            .data(this.data)
            .enter().append('text')
            .attr('class', 'label')
            .attr('y', function(d){ return self.xScale(d[self.cfg.label]) + (self.xScale.bandwidth()/2) + 3 })
            .attr('x', function(d){ return +d[self.cfg.key] < 0 ? 4 : -4 })
            .attr('text-anchor', function(d){ return +d[self.cfg.key] < 0 ? 'start' : 'end'})
            .text(function(d){ return d[self.cfg.label]})
            .attr("transform", "rotate(-90)")

        if(this.cfg.mean){
            this.mean = this.g.append('line')
                .attr('class', 'axis axis--mean')
                .attr('stroke', 'black')
                .attr('stroke-width', 1)
                .attr('x1', 0)
                .attr('y1', this.yScale(this.cfg.mean))
                .attr('x2', this.cfg.width)
                .attr('y2', this.yScale(this.cfg.mean))

            if(this.cfg.meanlabel){
                this.meanlabel = this.g.append('text')
                    .attr('class', 'label label--mean')
                    .attr('text-anchor', 'end')
                    .attr('x', this.cfg.width)
                    .attr('y', this.yScale(this.cfg.mean) - 3)
                    .text(this.cfg.meanlabel)
            }
        }

    }

    // gridlines in x axis function
    make_x_gridlines() {       
        return d3.axisBottom(this.xScale);
    }

    // gridlines in y axis function
    make_y_gridlines() {       
        return d3.axisLeft(this.yScale);
    }

    resize(){
        var self = this;

        this.cfg.width = parseInt(this.selection.node().offsetWidth) - this.cfg.margin.left - this.cfg.margin.right;
        this.cfg.height = parseInt(this.selection.node().offsetHeight)- this.cfg.margin.top - this.cfg.margin.bottom;

        this.xScale.rangeRound([0, this.cfg.width]);
        this.yScale.rangeRound([0, this.cfg.height]);

        this.svg
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.yGrid
            .call(self.make_y_gridlines()
            .tickSize(-self.cfg.width)
            .tickFormat(d3.format("d")));

        this.xAxis.attr("transform", "translate(0," + this.yScale(0) + ")")
        this.xAxisLine.attr('x2', this.cfg.width)

        this.xAxisLabels
            .attr('y', function(d){ return self.xScale(d[self.cfg.label]) + (self.xScale.bandwidth()/2) + 3 })
            .attr('x', function(d){ return +d[self.cfg.key] < 0 ? 4 : -4 })

        this.itemg.attr('transform', function(d, i){
            return 'translate('+ self.xScale(d[self.cfg.label]) +',0)';
        })

        this.rects
            .attr('width', this.xScale.bandwidth())
            .attr('y', function(d, i){
                return self.yScale(+d[self.cfg.key]);
            })
            .attr('height', function(d){
                return self.cfg.height - self.yScale(+d[self.cfg.key]);
            })

        this.rects.attr('y', function(d, i){
                return +d[self.cfg.key] < 0 ? self.yScale(0) : self.yScale(+d[self.cfg.key]);
            })
            .attr('height', function(d){
                return +d[self.cfg.key] < 0 ? self.yScale(+d[self.cfg.key]) - self.yScale(0) : self.yScale(0) - self.yScale(+d[self.cfg.key]);
            });

        if(this.cfg.mean){
            this.mean.attr('y1', this.yScale(self.cfg.mean))
                .attr('x2', self.cfg.width)
                .attr('y2', self.yScale(self.cfg.mean))

            if(this.cfg.meanlabel) this.meanlabel.attr('x', this.cfg.width).attr('y', this.yScale(this.cfg.mean) - 3)

        }

        if(self.cfg.title) this.title.attr('transform', 'translate('+ (self.cfg.width/2) +',20)')
        if(self.cfg.source) this.source.attr('transform', 'translate('+ (self.cfg.margin.left) +','+(self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom - 5)+')')

    }
}