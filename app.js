let mapLatitude = 50.44;
let mapLongitude = 30.52;
let mapZoom = 13;

let mymap = L.map('leaflet').setView([mapLatitude, mapLongitude], mapZoom);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZHNvZGV2IiwiYSI6ImNqb2x4OGxvdDBzcGczcW8xcnZqNTluZ2sifQ.4bPA6D82r9BY7npD5jPGRw'
}).addTo(mymap);

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

function setMerker(x, y) {
    L.marker([51.5, -0.15]).addTo(mymap);
}

mymap.on('click', onMapClick);

function Point() {
    this.latitude = mapLatitude + Math.random();
    this.longitude = mapLongitude + Math.random();
}

function Leaf(name, point) {
    this.name = name;
    this.point = point;
    this.selected = false;
    this.visited = false;
}

function Branch(name, scions) {
    this.name = name;
    this.scions = scions;
    this.expand = true;
    this.type = scions[0] instanceof Branch ? 'branch' : 'leaf';
}

//TODO: Send array like parameter to createLayer
function Tree(rank, baseLayerQuantity, branchesQuantity, leafsQuantity) {
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
                        arr[i] = new Leaf('leaf ' + i, new Point(mapLatitude + Math.random(), mapLongitude + Math.random()))
                    }
                    break;
                }
            }
        }
        return arr;
    }
}

function createTree(ra) {
    let treeRank = 3;

    return createLayers(treeRank, 3);
}

function createLayers(treeRank, branchesQuantity) {
    treeRank--;
    let tree = new Array(branchesQuantity);
    for (let i = 0; i < branchesQuantity; i++) {
        let branch = {};
        branch.name = `Item ${i + 1}`;
        branch.rank = treeRank;
        branch.showbranch = false;
        branch.branch = treeRank > 0 ? createLayers(treeRank, 2) : {
            latitude: mapLatitude + Math.random(),
            longitude: mapLongitude + Math.random(),
            selected: false
        };
        tree[i] = branch;
    }
    return tree;
}

new Vue({
    el: '#tree',
    data: {
        tree : new Tree(3,2,2,2),        
        visitedPoints: null,
        actualPoints: null
    },    
    methods: {
        expandScions: function (scion) {
            scion.expand = !scion.expand;
            if (scion.type =='branch'){
                for(let sc of scion.scions) {

                    sc.expand = !sc.expand;
                    this.expandScions(sc);
                }
            }     
            else if(scion.type =='branch'){
                scion.selected = true;
            }  
        }
    }
});

new Vue({
    el: '#map',
    data: {},
    methods: {
        setMarker: function (e) {

        },
        getLeafs: function () {

        }
    }
});

new Vue({
    el: '#list',
    data: {
        message: 'List component'
    }
});











