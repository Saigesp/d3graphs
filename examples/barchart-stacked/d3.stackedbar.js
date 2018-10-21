class StackedBarChart {

    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            margin: {top: 10, right: 10, bottom: 10, left: 40},
            key: 'key',
            keys: [],
            colors: [],
            labels: true,
            fontsize: '12px',
            greyColorStart: 240,
            greyColorStep: 15,
            label_space: 150,
            currentkey: false,
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

        this.yScale = d3.scaleLinear().rangeRound([0, this.cfg.height]);
        this.yAScale = d3.scaleLinear().rangeRound([this.cfg.height, 0]);

        this.cfg.separation = this.cfg.width / this.data.length;
        if(!this.cfg.labels) this.cfg.label_space = 0;
        this.cfg.height = this.cfg.height + this.cfg.label_space;

        this.cfg.greyColorMin = this.cfg.greyColorStart - (this.cfg.keys.length * this.cfg.greyColorStep)

        window.addEventListener("resize", function(){self.resize()});

        this.initGraph();
    }

    initGraph() {
        var self = this;

        this.data.forEach(function(d){
            d.total = 0;
            self.cfg.keys.forEach(function(p){
                d.total += d[p]
            })

        })
        this.data.sort(function(x, y){
            return d3.descending(x.total, y.total);
        })

        this.yScale.domain([0, d3.max(self.data, function(d){ return d.total;})]);
        this.yAScale.domain(self.yScale.domain())

        this.svg = this.selection.append('svg')
            .attr("class", "chart barchar barchart-stacked")
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        this.yGrid = this.g.append("g")           
            .attr("class", "grid grid--y")
            .call(self.make_y_gridlines()
                .tickSize(-this.cfg.width)
                .tickFormat("")
                .ticks(3, ".0f"));

        this.g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(self.yAScale)
                .ticks(3, ".0f"));

        this.itemg = this.g.selectAll('.itemg')
            .data(this.data)
            .enter().append('g')
            .attr('class', 'itemg')
            .attr('transform', function(d, i){
                return 'translate('+(i*self.cfg.separation)+','+(self.cfg.height-self.cfg.label_space)+')';

            })

        this.cfg.keys.forEach(function(provider, n){
            self.itemg.append('rect')
                .attr('width', self.cfg.separation-1)
                .attr('height', function(d){
                    return self.yScale(d[provider]);
                })
                .attr('x', 0)
                .attr('y', function(d){
                    var pt = 0;
                    for(var i = n; i >= 0; i--){
                        pt = pt - d[self.cfg.keys[i]];
                    }
                    return self.yScale(pt);
                })
                .attr('fill', function(d){
                    var greyColor = self.cfg.greyColorMin + (self.cfg.greyColorStep*n);
                    return d.name == !self.cfg.currentkey || self.cfg.currentkey ? self.cfg.colors[n] : 'rgb('+greyColor+','+greyColor+','+greyColor+')'})
        })

        if(this.cfg.labels){
            var text = this.itemg.append('text')
                .attr('y', (self.cfg.separation/2) + 4)
                .attr('x', -5)
                .attr('class', 'label')
                .attr("transform", "rotate(-90)")
                .attr('text-anchor', 'end')
                .style('font-size', self.cfg.fontsize)
                .style('font-weight', function(d){ return d.name == self.cfg.currentkey ? '700' : '100'; })
                .style('cursor', 'pointer')
                .text(function(d){ return d[self.cfg.key]; })
        }

    }

    make_y_gridlines() {       
        return d3.axisLeft(this.yAScale);
    }

    // Data functions
    setData(data){
        this.data = data;
    }

    getData(){
        return this.data;
    }

    resize(){
        var self = this;

        this.cfg.width = parseInt(this.selection.node().offsetWidth) - this.cfg.margin.left - this.cfg.margin.right;
        this.cfg.separation = this.cfg.width / this.data.length;

        this.svg.attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)

        this.itemg.attr('transform', function(d, i){
                return 'translate('+(i*self.cfg.separation)+','+(self.cfg.height-self.cfg.label_space)+')';
            })

        this.itemg.selectAll('rect').attr('width', self.cfg.separation-1);
        this.itemg.selectAll('text').attr('y', (self.cfg.separation/2) + 4);

        this.yGrid.call(self.make_y_gridlines()
            .tickSize(-this.cfg.width)
            .tickFormat("")
            .ticks(3, ".0f"))

    }

};
