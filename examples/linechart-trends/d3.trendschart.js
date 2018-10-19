class TrendLineChart {

    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 40, 'right': 20, 'bottom': 40, 'left': 40},
            'keys': [],
            'colors': ['#AAAAAA', '#000000'],
            'fontsize': '12px',
            'xgrid': false,
            'ygrid': false,
            'yscaleformat': '.0f',
            'datefield': 'date',
            'dateformat': '%Y-%m-%d', // https://github.com/d3/d3-time-format/blob/master/README.md#locale_format
            'internalR': 4,
            'externalR': 12,
            'title': false,
            'source': false,
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

        this.xScale = d3.scaleTime().rangeRound([0, this.cfg.width]),
        this.yScale = d3.scaleLinear().rangeRound([this.cfg.height, 0]);
        this.colorScale = d3.scaleOrdinal().range(this.cfg.colors)

        // Extract the x labels for the axis and scale domain
        this.xLabels = this.data.map(function (d) { return +d[self.cfg.datefield]; })

        this.parseTime = d3.timeParse(this.cfg.dateformat),
        this.formatTime = d3.timeFormat('%d-%m-%Y'),

        this.line = d3.line()
            .x(function(d){ return self.xScale(d.x); })
            .y(function(d){ return self.yScale(d.y); });

        this.initGraph();
    }

    initGraph() {
        let self = this;

        this.dataT = [];
        this.cfg.keys.forEach(function(j,i){
            self.dataT[i] = {};
            self.dataT[i]['key'] = j
            self.dataT[i]['values'] = []
        });

        this.data.forEach(function(d){
            d.jsdate = self.parseTime(d[self.cfg.datefield]);
            d.min =  9999999999;
            d.max = -9999999999;
            self.cfg.keys.forEach(function(j, i){
                self.dataT[i]['values'].push({'x': d.jsdate, 'y': +d[j], 'k': i})
                if (d[j] < d.min) d.min = +d[j];
                if (d[j] > d.max) d.max = +d[j];
            })
        });

        this.xScale.domain(d3.extent(this.data, function(d) { return d.jsdate; }));
        this.yScale.domain([0, d3.max(this.data, function(d) { return d.max; })]);

        // Least Squares Calculus
        var xSeries = d3.range(1, this.xLabels.length + 1);
        var ySeries = this.data.map(function(d) { return parseFloat(+d[self.cfg.keys[0]]); });
        var leastSquaresCoeff = leastSquares(xSeries, ySeries);

        var x1 = this.xLabels[0];
        var y1 = leastSquaresCoeff[0] + leastSquaresCoeff[1];
        var x2 = this.xLabels[this.xLabels.length - 1];
        var y2 = leastSquaresCoeff[0] * xSeries.length + leastSquaresCoeff[1];
        var trendData = [[x1,y1,x2,y2]];
        var parseTrendTime = d3.timeParse("%Y");

        // SVG
        this.svg = this.selection.append('svg')
            .attr("class", "chart linechart linechart-trends")
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        // GRIDLINES
        if(this.cfg.xgrid){
            this.xGrid = this.g.append("g")           
                .attr("class", "grid grid--x")
                .call(self.make_x_gridlines()
                    .tickSize(self.cfg.height)
                    .tickFormat(""))
        }

        if(this.cfg.ygrid){
            this.yGrid = this.g.append("g")           
                .attr("class", "grid grid--y")
                .call(self.make_y_gridlines()
                    .tickSize(-self.cfg.width)
                    .tickFormat("")
                    .ticks(3, self.cfg.yscaleformat));
        }

        // AXIS
        this.g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.cfg.height + ")")
            .call(d3.axisBottom(self.xScale));

        this.g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(self.yScale)
                .ticks(3, self.cfg.yscaleformat));

        // TITLE
        if(self.cfg.title){
            this.svg.append('text')
                .attr('class', 'title label')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate('+ (self.cfg.width/2) +',20)')
                .text(self.cfg.title)
        }

        // SOURCE
        if(self.cfg.source){
            this.svg.append('text')
                .attr('class', 'source label')
                .attr('transform', 'translate('+ (self.cfg.margin.left) +','+(self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom - 5)+')')
                .html(self.cfg.source)

        }

        // LINES
        this.lineg = this.g.selectAll(".line--group")
            .data(this.dataT)
            .enter().append('g')
            .attr("class", function(d){
                return "line--group d3-"+d.key;
            });

        this.lineg.append('path')
            .attr("class", "line")
            .style('stroke', function(d, i){ return self.colorScale(i); })
            .attr("d", function(d) {
                return self.line(d.values);
            });

        // LEAST SQUARES DRAW
        this.trends = this.g.append('g')
            .attr('class', 'trends')

        this.trendline = this.trends.selectAll(".trendline")
            .data(trendData).enter()
            .append("line")
            .attr("class", "line trendline")
            .attr("x1", function(d) { return self.xScale(parseTrendTime(d[0])); })
            .attr("y1", function(d) { return self.yScale(+d[1]); })
            .attr("x2", function(d) { return self.xScale(parseTrendTime(d[2])); })
            .attr("y2", function(d) { return self.yScale(+d[3]); })
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        // POINTS
        this.pointsg = this.g.selectAll('.point--group')
            .data(this.data).enter()
            .append('g')
            .attr('class', 'point--group')
            .attr('transform', function(d){
                return 'translate('+self.xScale(d.jsdate)+','+self.yScale(d[self.cfg.keys[0]])+')';
            })

        this.pointsg.append('circle')
            .attr('class', 'external')
            .attr('r', this.cfg.externalR)
            .on('mouseover', function(){
                d3.select(this.parentNode).classed('is-active', true);
                self.svg.classed('is-active', true)
            })
            .on('mouseout', function(){
                d3.select(this.parentNode).classed('is-active', false);
                self.svg.classed('is-active', false)
            })

        this.pointsg.append('circle')
            .attr('class', 'internal')
            .attr('r', this.cfg.internalR)

        this.pointsg.append('text')
            .attr('class', 'label point-label')
            .attr('y', 4)
            .attr('x', function(d){
                return self.xScale(d.jsdate) > self.cfg.width*0.8 ? -8 : 8;
            })
            .attr('text-anchor', function(d){
                return self.xScale(d.jsdate) > self.cfg.width*0.8 ? 'end' : 'start';
            })
            .text(function(d){
                return d[self.cfg.keys[0]]
            })
    }

    // gridlines in x axis function
    make_x_gridlines() {       
        return d3.axisBottom(this.xScale);
    }

    // gridlines in y axis function
    make_y_gridlines() {       
        return d3.axisLeft(this.yScale);
    }
    // Data functions
    setData(data){
        this.data = data;
    }

    getData(){
        return this.data;
    }

    resize(){
    }

};
