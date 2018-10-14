# d3graphs
Personal d3js visualizations codebase. **Currently in development**

See all examples on https://bl.ocks.org/Saigesp

**Features**
- Graphs are made as javascript classes, so they can be reused and configured.
- Graphs are responsive and resizable.
- Graphs allow data update.

**Dependencies**
- D3 version 4.0 or higher
- Maps are built with Mapbox and Leaflet
- Some dataviz can require special libraries to work, see examples

## How to use
- Import dependencies
- Create an object and pass selection, data and options

```javascript
var chart = new BarChart(d3.select('#chart-container'), data, {
    'key': 'ton',
    'label': 'year',
    'color': '#DD8500',
})
```

## Available charts

| Chart | Demo | Preview |
| ------| ------- | ------ |
| [Horizontal Barchart](examples/barchart/) | [f906ae2bab36f03a59c78e8d669aa68c](http://bl.ocks.org/Saigesp/f906ae2bab36f03a59c78e8d669aa68c) | ![Barchart](https://github.com/Saigesp/d3graphs/blob/master/examples/barchart/thumbnail.png?raw=true) |
| [Stacked Barchart](examples/barchart-stacked/) | [f2605e92dff3a976d97ae6027d07f6b5](https://bl.ocks.org/Saigesp/f2605e92dff3a976d97ae6027d07f6b5) | ![Stacked barchart](https://github.com/Saigesp/d3graphs/blob/master/examples/barchart-stacked/thumbnail.png?raw=true) |
| [Calendar](examples/calendar/) | [0b0995536ec3e691cec6725783870a70](https://bl.ocks.org/Saigesp/0b0995536ec3e691cec6725783870a70) | ![Calendar](https://github.com/Saigesp/d3graphs/blob/master/examples/calendar/thumbnail.png?raw=true) |
| [Linear Calendar](examples/calendar-linear/) | [a0b505c3d0e42cfbdf39b0d2c19ada0c](https://bl.ocks.org/Saigesp/a0b505c3d0e42cfbdf39b0d2c19ada0c) | ![Calendar](https://github.com/Saigesp/d3graphs/blob/master/examples/calendar-linear/thumbnail.png?raw=true) |
| [Multiple Linechart](examples/linechart/) | [13029d084201f5012391e231215961f0](https://bl.ocks.org/Saigesp/13029d084201f5012391e231215961f0) | ![Multiple linechart](https://github.com/Saigesp/d3graphs/blob/master/examples/linechart/thumbnail.png?raw=true) |
| [Trends Linechart](examples/linechart-trends/) | [281f92fae4192c4a569fc992d10a9914](http://bl.ocks.org/Saigesp/281f92fae4192c4a569fc992d10a9914) | ![Trends linechar](https://github.com/Saigesp/d3graphs/blob/master/examples/linechart-trends/thumbnail.png?raw=true) |
| [Piechart](examples/piechart/) | [ab01821e77d2f1c44e9d71c826e54db6](https://bl.ocks.org/Saigesp/ab01821e77d2f1c44e9d71c826e54db6) | ![Piechart](https://github.com/Saigesp/d3graphs/blob/master/examples/piechart/thumbnail.png?raw=true) |
| [Slopegraph](examples/slopegraph/) | [ae534a5cedfa284086717f1814bafe81](https://bl.ocks.org/Saigesp/ae534a5cedfa284086717f1814bafe81) | ![Slopegraph](https://github.com/Saigesp/d3graphs/blob/master/examples/slopegraph/thumbnail.png?raw=true) |
| [Stripelines](examples/stripelines/) | [eda813560c801474904004d6b6b1cc4c](https://bl.ocks.org/Saigesp/eda813560c801474904004d6b6b1cc4c) | ![Stripelines](https://github.com/Saigesp/d3graphs/blob/master/examples/stripelines/thumbnail.png?raw=true) |
  


## Development

- Requires git with SSH

```sh
sh pull_examples.sh
sh push_examples.sh
```
