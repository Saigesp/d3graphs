class BrushedHistogram {
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;
        this.fstupdated = false;
        this.events = {
            brush: ()=>{}
        }
        
        this.cfg = {
            'margin': {'top': 10, 'right': 14, 'bottom': 60, 'left': 10},
            'key': 'total',
            'thresholds': 12,
            'separation': 1,
            'sliderradius': 8,
            'sliderwidth': 5,
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

        this.xScale = d3.scaleLinear()
            .range([0, this.cfg.width]);

        this.yScale = d3.scaleLinear()
            .range([this.cfg.height, 0]);

        this.xScaleBrush = d3.scaleLinear()
            .range([0, 100])
            .domain([0, self.cfg.width ]);
            

        this.initGraph();
    }

    initGraph() {
        var self = this;

        this.svg = this.selection.append('svg')
            .attr("class", "chart histogram histogram-brushed")
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        /* Brush */
        this.brush = d3.brushX()
            .extent([[0,0],[self.cfg.width,self.cfg.sliderwidth]])
            .on("brush", () => { self.brushmove()})
            .on("end", () => { self.brushend()});

        var slider = this.svg.append('g')
            .attr('class', 'slider')
            .attr("transform", "translate(" + self.cfg.margin.left + "," + (self.cfg.height + self.cfg.margin.top + (self.cfg.margin.bottom / 2)) + ")");

        var line = slider.append("line")
            .attr("x1", 0)
            .attr("x2", self.cfg.width)
            .attr("y1", self.cfg.sliderradius / 2)
            .attr("y2", self.cfg.sliderradius / 2)
            .attr("stroke", "#CCC")
            .attr("stroke-linecap", "round");

        this.gBrush = slider.append('g')
            .attr('class', 'brush')
            .call(self.brush);

        this.gBrush.selectAll(".handle")
            .style("width", self.cfg.sliderradius*2)
            .style("height", self.cfg.sliderradius*2)
            .attr("transform", "translate("+(-self.cfg.sliderradius/2)+","+(self.cfg.sliderwidth-self.cfg.sliderradius+1)+")")
            .attr("fill", "black")
            .attr("ry", self.cfg.sliderradius)
            .attr("rx", self.cfg.sliderradius);

        this.resetBrush()

    }

    brushmove(){
        var self = this;
        
        var brushtooltip = this.gBrush.selectAll('.leyends')
            .data(d3.event.selection, (d)=> { return d; })

        brushtooltip.exit().remove()

        brushtooltip.attr('transform', (d)=>{ return "translate("+d+",10)" })
            .select('text')
            .text((d)=>{return Math.round(self.xScaleBrush(d))})

        brushtooltip.enter().append('g')
            .attr('class', 'leyends')
            .attr('transform', (d)=>{
                return "translate("+d+",10)"
            })
            .append('text')
            .attr('class', 'leyend')
            .attr('text-anchor', 'middle')
            .attr('y', 12)
            .text((d)=>{return Math.round(self.xScaleBrush(d))})

    }

    brushend(){

        if(!d3.event.selection){
            this.gBrush.selectAll('.leyends').remove()       
        }

        var self = this;
        var filterdata = {source: this}
        if(d3.event.selection && this.initdata){ // change brush
            filterdata.items = this.initdata.filter((d)=>{
                return d[self.cfg.key] >= self.xScaleBrush(d3.event.selection[0]) && d[self.cfg.key] <= self.xScaleBrush(d3.event.selection[1])
            })
            filterdata.filtered = this.initdata.filter((d)=>{
                return d[self.cfg.key] < self.xScaleBrush(d3.event.selection[0]) || d[self.cfg.key] > self.xScaleBrush(d3.event.selection[1])
            })
            //console.log('change', this.initdata.length, filterdata.filtered.length);

        }else{ // remove brush
            filterdata.items = this.initdata
            filterdata.filtered = []
        }

        this.events.brush(filterdata)
    }

    update(items, source=false) {
        var self = this;
        
        if(items.length<=5) return // prevent errors

        // Data calculus
        var dataH = d3.histogram()
            .thresholds(self.cfg.thresholds)(items.map(function(d) {
                return +d[self.cfg.key];
            }));

        this.data = items

        // First data
        if(!this.fstupdated){
            this.initdata = items
            this.xScaleBrush.range([0, dataH[dataH.length-1].x1]);
            this.fstupdated = true
        }

        // Draw
        this.yScale.domain([0, d3.max(dataH, (d) => { return d.length; }) ]);
        this.xScale.domain([dataH[0].x0, dataH[dataH.length-1].x1 ]);

        this.drawBars(dataH)
        

    }
    
    resetBrush() {
        this.brush.move(this.gBrush, [0, this.cfg.width])
    }

    drawBars(data){
        var self = this;

        this.g.selectAll("g").remove()

        var bars = this.g.selectAll("g")
            .data(data);
        
        var newItems = bars.enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", function(d) {
                return "translate(" + self.xScale(d.x0) + "," + self.yScale(d.length) + ")";
            });

        newItems.append("rect")
            .attr("width", function(d) {
                return self.xScale(d.x1) - self.xScale(d.x0) - self.cfg.separation;
            })
            .attr("height", function(d) {
                return self.cfg.height - self.yScale(d.length);
            });

        newItems.append("text")
            .attr("class", "leyend")
            .attr("dy", ".75em")
            .attr("y", function(d) {
                return self.cfg.height - self.yScale(d.length) + 6;
            })
            .attr("text-anchor", "middle")
            .text(function(d) {
                return self.xScale(d.x1) - self.xScale(d.x0) > 14 ? Math.round(d.x0) : '';
                return Math.round(d.x0);
            });

        var extra = this.g.append("g")
            .attr("class", "bar")
            .append('text')
            .attr("class", "leyend")
            .attr("dy", ".4em")
            .attr("y", self.cfg.height +  self.cfg.margin.top)
            .attr("x", self.cfg.width)
            .attr("text-anchor", "middle")
            .text(function(d) {
                return data[data.length-1].x1
            });

    }

    on(listener, fn){
        this.events[listener] = fn;
    }

}
