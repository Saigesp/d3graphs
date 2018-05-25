class D3MapPoints extends D3Map  {

    constructor(selection, data, config = {}) {
        super(selection, data, config)
        this.circles = {};
        this.colorScale = d3.scaleSequential(d3.interpolateViridis)
    }

    loadPoints(points){
        var self = this;
        var tdata = {};

        this.colorScale.domain([0 , d3.mean(points, (d)=>{ return d.reviews })*2]);

        // comprobamos puntos locales
        self.data.forEach(function(d){
            if(points.indexOf(d) === -1){
                // punto local NO existe en remoto -> borramos
                self.map.removeLayer(self.circles[d.id])
                delete self.circles[d.id]
            }else{
                // punto local SI existe en remoto -> guardamos
                tdata[d.id] = d
            }
        });


        // comprobamos datos remotos
        points.forEach(function(d){

            // punto remoto no existe en local -> creamos
            if(self.data.indexOf(d) === -1){
                // puntos a crear
                var lnglat = new L.LatLng(+d.latitude, +d.longitude);
                var circle = new L.circle((lnglat), self.cfg.circlesize, {
                    color: self.colorScale(+d.reviews),
                    opacity:1,
                    fillOpacity:.5,
                    className: 'point id-'+d.id,
                })
                circle.addTo(self.map)
                self.circles[d.id] = circle
                tdata[d.id] = d
            }
        })

        self.data = []
        for (var property in tdata) {
            if (tdata.hasOwnProperty(property)) {
                self.data.push(tdata[property])
            }
        }

    }
}
