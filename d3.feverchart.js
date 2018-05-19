class FeverChart {

    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 10, 'right': 20, 'bottom': 50, 'left': 40},
            //'key': 'key',
            //'currentkey':'*',
            'keys': [],
            'colors': ['#AAAAAA', '#000000'],
            'fontsize': '12px',
            //'greyColorStart': 240,
            //'greyColorStep': 15,
            'xgrid': false,
            'ygrid': false,
            'datefield': 'date',
            'dateformat': '%Y-%m-%d', // https://github.com/d3/d3-time-format/blob/master/README.md#locale_format
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

        this.xScale = d3.scaleTime().rangeRound([0, this.cfg.width]),
        this.yScale = d3.scaleLinear().rangeRound([this.cfg.height, 0]);
        this.colorScale = d3.scaleOrdinal().range(this.cfg.colors)

        //this.cfg.greyColorMin = this.cfg.greyColorStart - (this.cfg.keys.length * this.cfg.greyColorStep)

        this.parseTime = d3.timeParse(this.cfg.dateformat),
        this.formatTime = d3.timeFormat('%d-%m-%Y'),

        //this.bisectDate = d3.bisector(function(d) { return d[xvalue]; }).left

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

        //console.log(this.dataT);
        // SVG
        this.svg = this.selection.append('svg')
            .attr("class", "chart linechart feverchart")
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
                    .ticks(3, ".0f"));
        }

        // AXIS
        this.g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.cfg.height + ")")
            .call(d3.axisBottom(self.xScale));

        this.g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(self.yScale)
                .ticks(3, ".0f"));

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
