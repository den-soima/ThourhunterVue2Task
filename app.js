const mapLatitude = 50.44;
const mapLongitude = 30.52;
const mapZoom = 13;

function Marker(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
}

function Leaf(name, markers) {
    this.name = name;
    this.markers = markers;
    this.selected = false;
    this.visited = false;
}

function Branch(name, scions) {
    this.name = name;
    this.scions = scions;
    this.expand = true;
    this.type = scions[0] instanceof Branch ? 'branch' : 'leaf';
    this.leafs = [];
}

function Tree(rank, baseLayerQuantity, branchesQuantity, leafsQuantity, markersQuantity) {
    this.branches = createLayer(rank, baseLayerQuantity, 'branch');
    this.rank = rank;

    function createLayer(rank, quantity, layerType) {
        let arr = [];
        if (rank > 0) {
            switch (layerType) {
                case 'branch': {
                    for (let i = 0; i < quantity; i++) {
                        arr[i] = new Branch('branch ' + i, createLayer(rank - 1, branchesQuantity, rank > 2 ? 'branch' : 'leaf'))
                    }
                    break;
                }
                case 'leaf': {
                    for (let i = 0; i < leafsQuantity; i++) {
                        arr[i] = new Leaf('leaf ' + i, createMarkers())
                    }
                    break;
                }
            }
        }
        return arr;
    }

    function createMarkers() {
        let arr = [];
        for (let i = 0; i < markersQuantity; i++) {
            arr[i] = new Marker(mapLatitude + Math.random() / 100, mapLongitude + Math.random() / 100)
        }
        return arr
    }

    for (let branch of this.branches) {
        branch.markers = recollectMarkers(branch);
    }

    function recollectMarkers(scion) {
        let arr = [];
        if (scion.type == 'branch') {
            for (let sc of scion.scions) {
                sc.markers = recollectMarkers(sc);
                arr.push(...sc.markers);
            }
        }
        else if (scion.type == 'leaf') {
            for (let leaf of scion.scions) {
                arr.push(...leaf.markers)
            }
        }
        return arr;
    }
}

function LeafletMap(tagId) {
    this.map = L.map(tagId).setView([mapLatitude, mapLongitude], mapZoom);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZHNvZGV2IiwiYSI6ImNqb2x4OGxvdDBzcGczcW8xcnZqNTluZ2sifQ.4bPA6D82r9BY7npD5jPGRw'
    }).addTo(this.map);

    this.setMarker = function (latitude, longitude) {
        L.marker([latitude, longitude]).addTo(this.map);
    }
}

const EventBus = new Vue();

new Vue({
    el: '#tree',
    data: {
        tree: new Tree(3, 2, 2, 2, 2),
        visitedPoints: null,
        actualPoints: null
    },
    methods: {
        expandScions: function (scion) {
            return;
            scion.expand = !scion.expand;
            if (scion.type == 'branch') {
                for (let sc of scion.scions) {

                    sc.expand = !sc.expand;
                    this.expandScions(sc);
                }
            }
            else if (scion.type == 'branch') {
                scion.selected = true;
            }
        },
        mapPoint: function (leaf) {
            EventBus.$emit('set-markers-on-map', [leaf.marker]);
        }

    }
});

new Vue({
    el: '#map',
    data: {
        leaflet: {},
        points: []
    },
    methods: {
        onMapClick: function (e) {
            alert("You clicked the map at " + e.latlng);
        },
    },
    mounted() {

        this.leaflet = new LeafletMap('leaflet');

        //console.log(this.leaflet.setMarker());

        //this.leaflet.setMarker(mapLatitude, mapLongitude);
        this.leaflet.map.on('click', this.onMapClick);

        EventBus.$on('set-markers-on-map', (markers) => {
            for (let marker of markers) {
                this.leaflet.setMarker(marker.latitude, marker.longitude)
            }
        })

    }
});

new Vue({
    el: '#list',
    data: {
        message: 'List component'
    }
});












