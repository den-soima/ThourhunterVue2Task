const mapLatitude = 50.44;
const mapLongitude = 30.52;
const mapZoom = 14;

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
}

function LeafletMap(tagId) {
    this.map = L.map(tagId).setView([mapLatitude, mapLongitude], mapZoom);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZHNvZGV2IiwiYSI6ImNqb2x4OGxvdDBzcGczcW8xcnZqNTluZ2sifQ.4bPA6D82r9BY7npD5jPGRw'
    }).addTo(this.map);

    this.markers = [];

    this.setMarkers = function (markers) {
        for(let marker of markers) {
           let m = L.marker([marker.latitude, marker.longitude]).addTo(this.map);
           m.on('mouseover', () => {
               EventBus.$emit('marker-mouse-over', marker)
           });
           this.markers.push(m);
        }
    };

    this.clearMap = function () {
        for (let marker of this.markers) {
            this.map.removeLayer(marker)
        }
    };
}

const EventBus = new Vue();

new Vue({
    el: '#tree',
    data: {
        tree: new Tree(3, 2, 3, 2, 1),
        visitedLeafs: new Set(),
        selectedLeafs: []
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
        pinMarker: function (scion) {

            for (let leaf of this.selectedLeafs){
                leaf.selected = false;
            }

            this.selectedLeafs = this.tree.getLeafs(scion); 
            let markers = [];
            
            for (let leaf of this.selectedLeafs){
                leaf.selected = true;
                leaf.visited = true;
                this.visitedLeafs.add(leaf);                
                markers.push(...leaf.markers)
            } 
            
            EventBus.$emit('set-markers-on-map', markers);
        }

    }
});

new Vue({
    el: '#map',
    data: {
        leaflet: {},
        markers: []
    },
    methods: {
        onMapClick: function (e) {
            alert("You clicked the map at " + e.latlng);
        },
    },
    mounted() {

        this.leaflet = new LeafletMap('leaflet');

        //console.log(this.leaflet.setMarkers());

        //this.leaflet.setMarkers(mapLatitude, mapLongitude);
        this.leaflet.map.on('click', this.onMapClick);

        EventBus.$on('set-markers-on-map', (markers) => {
            this.leaflet.clearMap();
            this.leaflet.setMarkers(markers)
        })

    }
});

new Vue({
    el: '#list',
    data: {
        listOfMarkers: []
    },
    methods:{
      deleteMarker: function (marker) {
          this.listOfMarkers.splice(this.listOfMarkers.indexOf(marker), 1)
      }  
    },
    mounted(){
        EventBus.$on('marker-mouse-over', (marker) =>{
            this.listOfMarkers.push(marker)
        })
    }
});












