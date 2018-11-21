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

class Point {
    constructor(latitude, magnitude) {
        this.latitude = latitude;
        this.magnitude = magnitude;
    }
}

class Leaf {
    constructor(name, point) {
        this.name = name;
        this.point = point;
        this.selected = false;
        this.visited = false;
    }
}

class Branch {
    constructor(name, scion) {
        this.name = name;
        this.scions = scion;
        this.visible = false;
        this.type = '';
        if (scion instanceof Branch) this.type = 'branch';
        if (scion instanceof Leaf) this.type = 'leaf';
    }
}

function createBaseLayer(branches, baseLayerQuantity) {
    for (let i = 0; i < baseLayerQuantity; i++) {
        branches.push(new Branch('BaseLayerItem' + 1, []))
    }
}

function createScions(branches, branchesQuantity, treeLayer, leafsQuantity) {
    treeLayer--;
    if (treeLayer > 1) {
        for (let i = 0; i < branchesQuantity; i++) {
            branches[i].scions.push(new Branch('Layer' + treeLayer + ': Item' + branchesQuantity, createScions(branches.scions, branchesQuantity, treeLayer)));
        }    
    }
    else if (treeLayer == 1) {
        for (let i = 0; i < leafsQuantity; i++) {
            branches[i].scions.push(new Leaf('Leaf' + leafsQuantity, new Point(mapLatitude + Math.random(), mapLongitude + Math.random())));
        }            
    }
}

class Tree {

    constructor(treeRank, baseLayerQuantity, branchesQuantity, leafsQuantity) {
        this.branches = [];
        createBaseLayer(this.branches, baseLayerQuantity);
        createScions(this.branches, branchesQuantity, treeRank, leafsQuantity);
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
        tree: new Tree(3, 4, 2, 3),
        visitedPoints: null,
        actualPoints: null
    },
    methods: {}
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







