let mapLatitude = 50.44;
let mapLongitude = 30.52;
let mapZoom = 13;

class Leaf{
    constructor(latitude, magnitude){
        this.latitude = latitude;
        this.magnitude = magnitude;
        this.selected = false;
        this.visited = false;
    }    
}

class Branch{
    constructor(scion){
        this.scion = scion;
        this.visible = false;
        this.type = '';
        if (scion instanceof Branch) this.type = 'branch';
        if (scion instanceof Leaf) this.type = 'leaf';        
    }   
    
}

let lf = new Leaf();

let br = Branch(Leaf);


new Vue({
    el: '#tree',
    data: {
        tree: createTree(),
        visitedPoints: null,
        actualPoints: null
    },
    methods: {
        onTreeClick: function (layer) {
            if (layer == null) return;

           
        },
        getAllLeafs: function (branch) {
            
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

function createTree() {
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



