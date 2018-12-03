const mapLatitude = 50.44;
const mapLongitude = 30.52;
const mapZoom = 14;

function Marker(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
}

function Leaf(name, marker) {
    this.name = name;
    this.marker = marker;
    this.selected = false;
    this.visited = false;
}

function Branch(name, scions) {
    this.name = name;
    this.scions = scions;
    this.expand = true;
    this.type = scions[0] instanceof Branch ? 'branch' : 'leaf';
}

function Tree(rank, baseLayerQuantity, branchesQuantity, leafsQuantity) {
    this.branches = createLayer(rank, baseLayerQuantity, 'branch');
    this.rank = rank;
    this.getLeafs = function (scion) {
        let arr = [];

        if (scion instanceof Leaf) {
            arr[0] = scion;
        }
        else {
            leafsPerLayer(scion);
        }

        return arr;

        function leafsPerLayer(scion) {
            if (scion.type == 'branch') {
                for (let sc of scion.scions) {
                    leafsPerLayer(sc)
                }
            }
            else if (scion.type == 'leaf') {
                for (let leaf of scion.scions) {
                    arr.push(leaf)
                }
            }
        }
    };

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
                        arr[i] = new Leaf('leaf ' + i, new Marker(mapLatitude + Math.random() / 100, mapLongitude + Math.random() / 100))
                    }
                    break;
                }
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

    this.setMarkers = function (markers) {
        for (let marker of markers) {
            let m = L.marker([marker.latitude, marker.longitude]).addTo(this.map);
            m.on('mouseover', () => {
                EventBus.$emit('marker-mouse-over', marker);
                this.removeMarker(m);
            });
        }
    };

    this.removeMarker = function (marker) {
        this.map.removeLayer(marker)
    }
}

const EventBus = new Vue();

new Vue({
    el: '#tree',
    data: {
        tree: new Tree(3, 2, 3, 2),
        visitedLeafs: []
    },
    methods: {
        pinMarker: function (scion) {
            let selectedLeafs = this.tree.getLeafs(scion);
            
            for (let leaf of this.visitedLeafs){
                leaf.selected = false;
            }
            let markers = [];
            for (let leaf of selectedLeafs) {
                let index = this.visitedLeafs.indexOf(leaf);
                if(index == -1){
                    leaf.visited = true;
                    leaf.selected = true;
                    this.visitedLeafs.push(leaf);
                    markers.push(leaf.marker);
                }
                else{
                    this.visitedLeafs[index].selected = true;
                }
            }
            
            
            EventBus.$emit('set-markers-on-map', markers);
        }
    },
    mounted() {
        EventBus.$on('delete-from-list', (marker) => {

            for (let leaf of this.visitedLeafs) {
                if (leaf.marker == marker) {
                    if (leaf.selected == true) {
                        EventBus.$emit('set-markers-on-map', new Array(marker));
                    }
                }
                else {
                    leaf.visited = false;
                }
            }
        });
    }
});

new Vue({
    el: '#map',
    data: {
        leaflet: {},
        markers: []
    },
    methods: {},
    mounted() {
        this.leaflet = new LeafletMap('leaflet');

        EventBus.$on('set-markers-on-map', (markers) => {
            //this.leaflet.clearMap();
            this.leaflet.setMarkers(markers)
        })
    }
});

new Vue({
    el: '#list',
    data: {
        listOfMarkers: []
    },
    methods: {
        deleteMarker: function (marker) {
            this.listOfMarkers.splice(this.listOfMarkers.indexOf(marker), 1);
            EventBus.$emit('delete-from-list', marker);
        },
    },
    mounted() {
        EventBus.$on('marker-mouse-over', (marker) => {
            this.listOfMarkers.push(marker);
        })
    }
});












