# D3js Calendar

D3 implementation of heatmap calendar

See the [demo](http://bl.ocks.org/Saigesp/0b0995536ec3e691cec6725783870a70) and more charts from [d3graphs repository](https://github.com/Saigesp/d3graphs)

**Features**:
- Object oriented approach
- Responsive

**Requires**:
- D3 v4+
- d3-scale-chromatic

**Default options**:
```javascript
{
    'margin': {'top': 30, 'right': 30, 'bottom': 10, 'left': 50},
    'key': 'key',
    'datefield': 'date',
    'dateformat': '%d-%m-%Y',
    'title': false,
    'source': false,
    'rectsize': 10,
    'colorScale': d3.interpolateRdBu,
    'emptycolor': '#EEE',
    'year': false,
    'mondaystart': false,
    'weekdayformat': '%a',
    'monthformat': '%b',
}
```