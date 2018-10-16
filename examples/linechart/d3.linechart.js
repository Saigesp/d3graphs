class LineChart {

    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 40, 'right': 20, 'bottom': 40, 'left': 40},
            'keys': [],
            'colors': ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
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

        this.cfg.width = parseInt(this.selection.node().offsetWidth) - this.cfg.margin.left - this.cfg.margin.right,
        this.cfg.height = parseInt(this.selection.node().offsetHeight)- this.cfg.margin.top - this.cfg.margin.bottom;

        Object.keys(config).forEach(function(key) {
            if(config[key] instanceof Object && config[key] instanceof Array === false){
                Object.keys(config[key]).forEach(function(sk) {
                    self.cfg[key][sk] = config[key][sk];
                });
            } else self.cfg[key] = config[key];
        });

        this.xScale = d3.scaleTime().rangeRound([0, this.cfg.width]),
        this.yScale = d3.scaleLinear().rangeRound([this.cfg.height, 0]);
        this.colorScale = d3.scaleOrdinal().range(this.cfg.colors)

        // Extract the x labels for the axis and scale domain
        this.xLabels = this.data.map(function (d) { return +d[self.cfg.datefield]; })

        this.parseTime = d3.timeParse(this.cfg.dateformat),
        this.formatTime = d3.timeFormat('%d-%m-%Y'),

        window.addEventListener("resize", function(){ self.draw() });

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

        this.data.forEach(function(d){ d.jsdate = self.parseTime(d[self.cfg.datefield]); });
        this.data.sort(function(a,b){return b.jsdate - a.jsdate })

        this.data.forEach(function(d){
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

        // SVG
        this.svg = this.selection.append('svg')
            .attr("class", "chart linechart")
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        // GRIDLINES
        if(this.cfg.xgrid) this.xGrid = this.g.append("g").attr("class", "grid grid--x")
        if(this.cfg.ygrid) this.yGrid = this.g.append("g").attr("class", "grid grid--y");

        // AXIS
        this.xAxis = this.g.append("g").attr("class", "axis axis--x")
        this.yAxis = this.g.append("g").attr("class", "axis axis--y")

        // TITLE
        if(self.cfg.title) this.title = this.svg.append('text').attr('class', 'title label').attr('text-anchor', 'middle').text(self.cfg.title)

        // SOURCE
        if(self.cfg.source) this.source = this.svg.append('text').attr('class', 'source label').html(self.cfg.source)

        // LINES
        this.lineg = this.g.selectAll(".line--group")
            .data(this.dataT)
            .enter().append('g')
            .attr("class", function(d){
                return "line--group line--group__"+d.key;
            });

        this.lines = this.lineg.append('path')
            .attr("class", "line")
            .style('stroke', function(d, i){ return self.colorScale(i); })

        // POINTS
        this.pointsg = []
        self.cfg.keys.forEach(function(k, i){
            var gp = self.g.selectAll('.point--group .point--group__'+k)
                .data(self.data).enter()
                .append('g')
                .attr('class', 'point--group point--group__'+k)

            gp.append('circle')
                .attr('class', 'external')
                .attr('r', self.cfg.externalR)
                .on('mouseover', function(){
                    d3.select(this.parentNode).classed('is-active', true);
                    self.svg.classed('is-active', true)
                })
                .on('mouseout', function(){
                    d3.select(this.parentNode).classed('is-active', false);
                    self.svg.classed('is-active', false)
                })

            gp.append('circle')
                .attr('class', 'internal')
                .attr('fill', function(){
                    return self.colorScale(i)
                })
                .attr('r', self.cfg.internalR)

            gp.append("title")
                .text(function(d) { return d[k] + ' ' + k});

            self.pointsg.push({selection:gp, key:k })
        })

        self.draw()

    }

    draw(){
        var self = this;

        this.cfg.width = parseInt(this.selection.node().offsetWidth) - this.cfg.margin.left - this.cfg.margin.right;
        this.cfg.height = parseInt(this.selection.node().offsetHeight)- this.cfg.margin.top - this.cfg.margin.bottom;

        this.xScale.rangeRound([0, this.cfg.width]);
        this.yScale.rangeRound([this.cfg.height,  0]);

        this.svg
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        // GRIDLINES
        if(this.cfg.xgrid){
            this.xGrid.call(self.make_x_gridlines()
                .tickSize(self.cfg.height)
                .tickFormat(""))
        }

        if(this.cfg.ygrid){
            this.yGrid.call(self.make_y_gridlines()
                .tickSize(-self.cfg.width)
                .tickFormat("")
                .ticks(3, self.cfg.yscaleformat));
        }

        // AXIS
        this.xAxis.attr("transform", "translate(0," + this.cfg.height + ")").call(d3.axisBottom(self.xScale));
        this.yAxis.call(d3.axisLeft(self.yScale).ticks(3, self.cfg.yscaleformat));

        // TITLE
        if(self.cfg.title) this.title.attr('transform', 'translate('+ ((self.cfg.width/2) + self.cfg.margin.left) +',20)')
        
        // SOURCE
        if(self.cfg.source) this.source.attr('transform', 'translate('+ (self.cfg.margin.left) +','+(self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom - 5)+')')

        // LINES
        this.line = d3.line()
            .x(function(d){ return self.xScale(d.x); })
            .y(function(d){ return self.yScale(d.y); });

        this.lines.attr("d", function(d) { return self.line(d.values) });

        // POINTS
        this.pointsg.forEach(function(p, i){
            p.selection.attr('transform', function(d){ return 'translate('+self.xScale(d.jsdate)+','+self.yScale(d[p.key])+')'; })
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


};
