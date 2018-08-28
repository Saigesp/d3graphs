class BarChart{

    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 40, 'right': 20, 'bottom': 50, 'left': 30},
            'key': 'key',
            'label': 'date',
            'color': 'steelblue',
            'title': false,
            'source': false,
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

        this.xScale = d3.scaleBand().rangeRound([0, this.cfg.width]).padding(0.1);
        this.yScale = d3.scaleLinear().rangeRound([0, self.cfg.height]);

        this.initGraph();
    }
    initGraph() {
        var self = this;

        this.xScale.domain(this.data.map(function(d) { return +d[self.cfg.label]; }));
        //this.xScale.domain(d3.extent(this.data, function(d) { return +d[self.cfg.label]; }));
        this.yScale.domain([d3.max(this.data, function(d){ return +d[self.cfg.key]}),0])

        this.svg = this.selection.append('svg')
            .attr("class", "chart barchart")
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

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

        // GRID
            this.yGrid = this.g.append("g")           
                .attr("class", "grid grid--y")
                .call(self.make_y_gridlines()
                    .tickSize(-self.cfg.width)
                    .tickFormat(d3.format(".0s")));

        // AXIS
        this.g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.cfg.height + ")")
            .call(d3.axisBottom(self.xScale))
                .selectAll("text") 
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.6em")
                .attr("transform", "rotate(-90)");

        this.itemg = this.g.selectAll('.itemgroup')
            .data(this.data)
            .enter().append('g')
            .attr('class', 'itemgroup')
            .attr('transform', function(d, i){
                return 'translate('+ self.xScale(+d[self.cfg.label]) +',0)';
        })

        this.itemg.append('rect')
            .attr('x', 0)
            .attr('y', function(d, i){
                return self.yScale(+d[self.cfg.key]);
            })
            .attr('width', this.xScale.bandwidth())
            .attr('height', function(d){
                return self.cfg.height - self.yScale(+d[self.cfg.key]);
            })
            .attr('fill', self.cfg.color)

    }

    // gridlines in x axis function
    make_x_gridlines() {       
        return d3.axisBottom(this.xScale);
    }

    // gridlines in y axis function
    make_y_gridlines() {       
        return d3.axisLeft(this.yScale);
    }
}