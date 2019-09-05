/*import {select, selectAll} from 'd3-selection';
import {scaleOrdinal, scaleLinear, scaleTime} from 'd3-scale';
import {timeParse, timeFormat} from 'd3-time-format';
import {max, extent} from 'd3-array';
import {axisBottom, axisLeft} from 'd3-axis';
import {line, curve} from 'd3-shape';
import {transition} from 'd3-transition';

import {curveLinear, curveBasis, curveBundle, curveStep, curveStepAfter, curveStepBefore, curveNatural} from 'd3-shape';

const d3base = {select, selectAll, scaleOrdinal, scaleLinear, scaleTime, timeParse, timeFormat, max, extent, axisBottom, axisLeft, line, curve, transition}
const d3 = {...d3base, curveLinear, curveBasis, curveBundle, curveStep, curveStepAfter, curveStepBefore, curveNatural}
*/
import * as d3 from "d3";

class ForceGraph {

    constructor(selection, data, config = {}) {
        this.selection = d3.select(selection);
        // Graph configuration
        this.cfg = {
            class: 'forcegraph',
            fontsize: 12,
        };

        Object.keys(config).forEach(key => {
            if(config[key] instanceof Object && config[key] instanceof Array === false){
                Object.keys(config[key]).forEach(sk => {
                    this.cfg[key][sk] = config[key][sk];
                });
            } else this.cfg[key] = config[key];
        });

        this.svg = this.selection.append('svg').attr("class", `chart chart--${this.cfg.class}`);
        this.g = this.svg.append('g')

        var zoom = d3.zoom()
            .scaleExtent([1 / 2, 96])
            .on("zoom", d => {
                this.g.attr("transform", d3.event.transform);
            });

        this.svg
            .call(zoom)
            .call(zoom.transform, d3.zoomIdentity);

        this.getCanvasSize()
        this.mapData(data)
        this.drawChart()
    }

    getCanvasSize(){
        this.cfg.width = parseInt(this.selection.node().offsetWidth);
        this.cfg.height = parseInt(this.selection.node().offsetHeight);
    }

    mapData(data){
        this.links = data.links ? data.links.map(d => Object.create(d)) : [];
        this.nodes = data.nodes ? data.nodes.map(d => Object.create(d)): [];

        var divs = [
            [1*this.cfg.width/6, this.cfg.height/2],
            [3*this.cfg.width/6, this.cfg.height/2],
            [5*this.cfg.width/6, this.cfg.height/2]
        ]

        this.simulation = d3.forceSimulation(this.nodes);

        divs.forEach((div, i)=>{
            this.simulation
                .force("center-"+i, this.isolate(d3.forceCenter(div[0], div[1]), this.nodes, d => {
                    return d.group%3 == i;
                }))
                .force("radius-"+i, this.isolate(d3.forceRadial((this.cfg.width/6), div[0], div[1]), this.nodes, d => {
                    return d.group%3 == i;
                }))
        })
        this.simulation
            //.force("charge2", d3.forceManyBody().strength(-30))
            .force("charge", d3.forceCollide().radius(20))

            //.force("radius", d3.forceRadial((this.cfg.width/4)-60, this.cfg.width/2, this.cfg.height/2))
            //.force("charge", d3.forceManyBody().strength(-30))
            //.force("charge", d3.forceCollide().radius(20))
            //.force("link", d3.forceLink(this.links).id(d => d.id))
    }

    drawChart(){
        this.svg.attr("viewBox", `0 0 ${this.cfg.width} ${this.cfg.height}`)
            .attr("width", this.cfg.width)
            .attr("height", this.cfg.height);

        const link = this.g.selectAll("line")
            .data(this.links)
          .join("line")
            .attr("stroke", "#777")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", '1px');

        const node = this.g.selectAll("circle")
            .data(this.nodes)
          .join("circle")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .attr("r", 5)
            .attr("fill", 'white')
            //.call(drag(this.simulation));

        node.append("title")
            .text(d => d.id);

        this.simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        //invalidation.then(() => simulation.stop());
    }

    /**
    * Update chart's data (links & nodes)
    */
    setData(data){
        this.mapData(data)
        this.drawChart()
    }

    /**
    * Isolate force
    * https://bl.ocks.org/mbostock/b1f0ee970299756bc12d60aedf53c13b
    */
    isolate(force, nodes, filter) {
        var initialize = force.initialize;
        force.initialize = () => {
            initialize.call(force, nodes.filter(filter));
        }
        return force;
    }
}

export default ForceGraph