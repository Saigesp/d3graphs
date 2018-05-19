class PolygonMap {
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;
        this.points = [];
        this.circles = {};
        
        this.cfg = {
            'margin': {'top': 10, 'right': 10, 'bottom': 10, 'left': 40},
            'lat': 0,
            'lng': 0,
            'zoom': 16,
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

        this.initGraph();

    }

    initGraph() {
        var self = this;

        this.map = L.map('map')
            .setView([self.cfg.lat,self.cfg.lng], self.cfg.zoom);

        this.mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        
        L.tileLayer(
            "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
        });

        L.tileLayer.provider('CartoDB.Positron').addTo(this.map);
        this.map._initPathRoot()    

        this.svg = this.selection.append("svg");
        this.g = this.svg.append("g");

    }

    loadGeojson(geojson) {
        var self = this;

        this.geojson = L.geoJson(geojson, {
            onEachFeature: function(feature, layer) {
/*
                layer.on({
                    click: function(e){
                        var bounds = layer.getBounds();
                        popup.setLatLng(bounds.getCenter());
                        popup.setContent(
                            '<div class="txt"><strong>' + e.target.feature.properties.name + '</strong><br>'+
                            e.target.feature.properties.airbnb_totals + ' {% trans "airbnb ads" %}<br>'+
                            '<a href="/region/'+ e.target.feature.id +'/subregions/">{% trans "See region" %}</a></div>'
                        );
                        map.openPopup(popup);
                    }
                })
*/
            },
            style: function(d) {
                return {
                    'weight':'2px',
                    'color':'#000000',
                    'fillColor': 'trasparent',
                    'fillOpacity': 0
                };
            }
        }).addTo(self.map);

    }
    removeGeojsons() {
        if(this.geojson){
            this.map.removeLayer(this.geojson);
        }
    }


    loadPoints(points){
        var self = this;
        self.points = points;
        
        self.circles[points[0].id.slice(0,6)] = []

        self.points.forEach(function(d){
            var lnglat = new L.LatLng(+d.latitude, +d.longitude);
            var circle = new L.circle((lnglat), 5, {
                //color: colorScale(data.price),
                opacity:.8,
                fillOpacity:0.2,
                className: "point " +d.id.slice(0,6),
            })
/*
            circle.on('click', function(d) {
                var bounds = circle.getBounds();
                popup.setLatLng(bounds.getCenter());
                popup.setContent(
                    '<img src="' + data.img + '" alt="" /><div class="txt">'+
                    '<strong>ID:</strong> ' + data.id + '<br>' +
                    '<strong>{% trans "Room Type" %}:</strong> ' + data.room_type + '<br>' +
                    '<strong>{% trans "Bedrooms" %}:</strong> ' + data.bedrooms + '<br>' +
                    '<strong>{% trans "Capacity" %}:</strong> ' + data.capacity + '<br>' +
                    '<strong>{% trans "Reviews" %}:</strong> ' + data.reviews + '<br>' +
                    '<strong>{% trans "Min. Nights" %}:</strong> ' + data.min_nights + '<br>' +
                    '<strong>{% trans "Price" %}:</strong> ' + data.price + ' €<br>' +
                    '<a href="'+data.url+'" target="_blank">{% trans "See web page" %}</a></div>'
                );
                map.openPopup(popup);
            });
*/          
            self.circles[d.id.slice(0,6)].push(circle)
            circle.addTo(self.map)
        });

    }

    removePoints(platform) {
        var self = this;
        self.circles[platform].forEach(function(item){
            self.map.removeLayer(item)
        })
    }



}
