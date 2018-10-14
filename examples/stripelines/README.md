# Warming stripes

D3 implementation of [warming stripes](http://www.climate-lab-book.ac.uk/2018/warming-stripes/).

See the [demo](http://bl.ocks.org/Saigesp/eda813560c801474904004d6b6b1cc4c) and more charts from [d3graphs repository](https://github.com/Saigesp/d3graphs)

**Features**:
- Object oriented approach
- Responsive

**Requires**:
- D3 v4+

**Default options**:
```javascript
{
    'margin': {'top': 30, 'right': 70, 'bottom': 36, 'left': 10},
    'key': 'key',
    'colorScale': d3.interpolateRdBu,
    'label': false,
    'label_x': 35,
    'label_y': 14,
    'units': 'ºC',
    'legendRanges': false, // [13,14,15,16]
    'title': false,
    'source': false,
}
```