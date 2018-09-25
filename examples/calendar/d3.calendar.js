class Calendar{
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 30, 'right': 20, 'bottom': 40, 'left': 40},
            'datefield': 'date',
            'dateformat': '%d-%m-%Y', // https://github.com/d3/d3-time-format/blob/master/README.md#locale_format
            'title': false,
            'source': false,
            'rectsize': 10,
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

        this.extentdates = d3.extent(this.data, function(d){ return d[self.cfg.datefield]});
        this.parseTime = d3.timeParse(this.cfg.dateformat);
        this.formatTime = d3.timeFormat(this.cfg.dateformat);


        this.initGraph();
    }
    initGraph() {
     var self = this;

        this.svg = this.selection.append('svg')
            .attr("class", "chart calendar")
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

        this.rects = this.g.selectAll("rect")
            .data(function(d) { return d3.timeDays(new Date(+self.extentdates[0].substr(0,4), 0, 1), new Date(+self.extentdates[0].substr(0,4) + 1, 0, 1)); })
            .enter().append("rect")
            .attr("width", self.cfg.rectsize)
            .attr("height", self.cfg.rectsize)
            .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * self.cfg.rectsize; })
            .attr("y", function(d) { return d.getDay() * self.cfg.rectsize; })
/*
            .datum(d3.timeFormat("%Y-%m-%d"));
*/

    }

}
