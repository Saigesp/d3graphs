class SlopeGraph {

    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 40, 'right': 160, 'bottom': 60, 'left': 160},
            'key': '',
            'currentkey': '',
            'color': '#1f77b4',
            'defaultcolor': '#AAA',
            'opacity': 0.5,
            'radius': 3,
            'title': false,
            'source': false,
            'labels': false,
            'transition': {'duration': 550}
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

        this.yScale = d3.scaleLinear().rangeRound([this.cfg.height, 0]);

        window.addEventListener("resize", function(){ self.draw() });

        this.initGraph();
    }

    initGraph() {
        let self = this;

        this.yScale.domain([
            d3.min(this.data, function(d) { return d.start < d.end ? d.start*0.9 : d.end*0.9 ; }),
            d3.max(this.data, function(d) { return d.start > d.end ? d.start*1.1 : d.end*1.1 ; })
        ]);

        // SVG
        this.svg = this.selection.append('svg')
            .attr("class", "chart slopegraph");

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        // VERTICAL AXIS
        this.startAxis = this.g.append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('class', 'axis axis--start')
            .attr('stroke', 'black')

        this.endAxis = this.g.append('line')
            .attr('class', 'axis axis--end')
            .attr('stroke', 'black')
            .attr('y1', 0)

        // TITLE
        if(self.cfg.title) this.title = this.svg.append('text').attr('class', 'title label').attr('text-anchor', 'middle').text(self.cfg.title)

        // SOURCE
        if(self.cfg.source) this.source = this.svg.append('text').attr('class', 'source label').html(self.cfg.source)

        // END-START LABELS
        if(self.cfg.labels){
            this.startl = this.g.append('text')
                .attr('class', 'label')
                .attr('text-anchor', 'middle')
                .attr('y', self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom -12)
                .text(self.cfg.labels[0])

            this.endl = this.g.append('text')
                .attr('class', 'label')
                .attr('text-anchor', 'middle')
                .attr('y', self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom -12)
                .text(self.cfg.labels[1])
        }

        // LINES
        this.lin = this.g.selectAll(".line--group")
            .data(this.data)

        this.lineg = this.lin
            .enter().append('g')
            .attr("class", "line--group");

        this.lines = this.lineg.append('line')
            .attr("class", "line")
            .attr('stroke', function(d, i){
                return d[self.cfg.key] == self.cfg.currentkey ? self.cfg.color : self.cfg.defaultcolor;
            })
            .style("stroke-width", function(d){
                return d[self.cfg.key] == self.cfg.currentkey ? '2px' : '1px';
            })
            .style("opacity", self.cfg.opacity)

        // POINTS
        this.startg = this.lineg.append('g')
            .attr('class', 'point--group point--group__start')
            .classed('current', function(d){ return d[self.cfg.key] == self.cfg.currentkey })

        this.endg = this.lineg.append('g')
            .attr('class', 'point--group point--group__end')
            .classed('current', function(d){ return d[self.cfg.key] == self.cfg.currentkey })
            .attr('transform', 'translate('+self.cfg.width+',0)')

        this.startg.append('circle')
            .attr('fill', function(d){
                return d[self.cfg.key] == self.cfg.currentkey ? self.cfg.color : self.cfg.defaultcolor
            })
            .attr('r', self.cfg.radius)

        this.endg.append('circle')
            .attr('fill', function(d){
                return d[self.cfg.key] == self.cfg.currentkey ? self.cfg.color : self.cfg.defaultcolor
            })
            .attr('r', self.cfg.radius)

        //LABELS
        this.startg.append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'end')
            .attr('y', 3)
            .attr('x', -5)
            .text(function(d){
                return d[self.cfg.key] +' '+ d.start
            })

        this.endg.append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'start')
            .attr('y', 3)
            .attr('x', 5)
            .text(function(d){
                return d.end + '  ' + d[self.cfg.key]
            })

        self.draw()
    }

    draw(){
        var self = this;

        this.cfg.width = parseInt(this.selection.node().offsetWidth) - this.cfg.margin.left - this.cfg.margin.right;
        this.cfg.height = parseInt(this.selection.node().offsetHeight)- this.cfg.margin.top - this.cfg.margin.bottom;

        this.svg
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.startAxis
            .attr('y2', self.cfg.height)

        this.endAxis
            .attr('x1', this.cfg.width)
            .attr('x2', this.cfg.width)
            .attr('y2', self.cfg.height)

        // TITLE
        if(self.cfg.title) this.title.attr('transform', 'translate('+ ((self.cfg.width/2) + self.cfg.margin.left) +',20)')
        
        // SOURCE
        if(self.cfg.source) this.source.attr('transform', 'translate('+ (self.cfg.margin.left) +','+(self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom - 5)+')')

        // END-START LABELS
        if(self.cfg.labels){
            this.startl.attr('y', self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom -12)
            this.endl.attr('x', self.cfg.width).attr('y', self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom -12)
        }

        this.yScale.rangeRound([this.cfg.height, 0]);

        self.update()

    }

    getData(){
        return this.data;
    }

    add(data){
        this.data = this.data.concat(data)
        this.update()
    }

    remove(filter){
        var self = this;
        this.data.forEach(function(d,i){
            let c = 0
            Object.keys(filter).forEach(function(key) {
                if(filter[key] == d[key]) c++
                
            })
            if(c == Object.keys(filter).length){
                self.data.splice(i,1)
            }
        })
        this.update()
    }

    update(){
        var self = this;
        var t = d3.transition().duration(self.cfg.transition.duration);

        this.yScale.domain([
            d3.min(this.data, function(d) { return d.start < d.end ? d.start*0.9 : d.end*0.9 ; }),
            d3.max(this.data, function(d) { return d.start > d.end ? d.start*1.1 : d.end*1.1 ; })
        ]);

        this.lin = this.g.selectAll(".line--group")
            .data(this.data, function(d){ return d[self.cfg.key]})

        // EXIT
        this.lin.exit().transition(t)
            .style("opacity", function(){ return 0; })
            .remove();

        // UPDATE
        this.startg = this.g.selectAll('.point--group__start')
            .transition(t)
            .attr('transform', function(d){ return 'translate(0,'+self.yScale(d.start)+')'})

        this.endg = this.g.selectAll('.point--group__end')
            .transition(t)
            .attr('transform', function(d){ return 'translate('+self.cfg.width+','+self.yScale(d.end)+')'})

        this.lines = this.lin.selectAll('.line')
            .transition(t)
            .attr("x1", 0)
            .attr("x2", this.cfg.width)
            .attr("y1", function(d){ return self.yScale(d.start)})
            .attr("y2", function(d){ return self.yScale(d.end)})

        // ENTER
        var news = this.lin
            .enter().append('g')
            .attr("class", "line--group")

        news.append('line') 
            .attr("class", "line")
            .attr('stroke', function(d, i){
                return d[self.cfg.key] == self.cfg.currentkey ? self.cfg.color : self.cfg.defaultcolor;
            })
            .style("opacity", self.cfg.opacity)
            .transition(t)
            .attr("x1", 0)
            .attr("x2", this.cfg.width)
            .attr("y1", function(d){ return self.yScale(d.start)})
            .attr("y2", function(d){ return self.yScale(d.end)})

        var gstart = news.append('g')
            .attr('class', 'point--group point--group__start')
        
        gstart
            .transition(t)
            .attr('transform', function(d){ return 'translate(0,'+self.yScale(d.start)+')'})

        var gend = news.append('g')
            .attr('class', 'point--group point--group__end')
            .attr('transform', 'translate('+self.cfg.width+',0)')

        gend
            .transition(t)
            .attr('transform', function(d){ return 'translate('+self.cfg.width+','+self.yScale(d.end)+')'})

        gstart.append('circle')
            .attr('fill', function(d){
                return d[self.cfg.key] == self.cfg.currentkey ? self.cfg.color : self.cfg.defaultcolor
            })
            .attr('r', self.cfg.radius)

        gend.append('circle')
            .attr('fill', function(d){
                return d[self.cfg.key] == self.cfg.currentkey ? self.cfg.color : self.cfg.defaultcolor
            })
            .attr('r', self.cfg.radius)

        gstart.append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'end')
            .attr('y', 3)
            .attr('x', -5)
            .text(function(d){
                return d[self.cfg.key] +' '+ d.start
            })

        gend.append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'start')
            .attr('y', 3)
            .attr('x', 5)
            .text(function(d){
                return d.end + '  ' + d[self.cfg.key]
            })

    }

};
