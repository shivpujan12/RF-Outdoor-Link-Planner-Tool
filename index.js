class Map {
    map = L.map('map');
    defaultCoords = [19.0760, 72.8777]; // Mumbai
    defaultZoom = 13;
    modal = new Modal();

    towers = [];
    links = [];

    linkingFrom = null;
    previewLine = null;
    suppressNextClick = false;

    constructor() {
        this.init()
    }

    init() {
        const map = this.map;
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        map.setView(this.defaultCoords, this.defaultZoom);

        const info = L.control({ position: 'topright' });
        info.onAdd = function () {
            const div = L.DomUtil.create('div', 'map-instructions');
            div.style.background = 'white';
            div.style.padding = '8px 12px';
            div.style.borderRadius = '4px';
            div.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
            div.style.fontSize = '13px';
            div.innerHTML = Config.info;
            return div;
        };
        info.addTo(map);

        map.on('click', (e) => this.handleClick(e))
        map.on('mousemove',(e)=>this.handleMouseMove(e))
        map.on('mouseup', () => {
            if (this.linkingFrom) {
                this.cancelLinking();
            }
        });
    }

    startLink(tower){
        this.linkingFrom = tower;
        this.towers.forEach(t => {
            if (t.freq !== tower.freq) {
                t.marker.setIcon(L.icon({
                    iconUrl: Config.RED_TOWER_IMAGE,
                    iconSize: [45,45],
                    iconAnchor: [22,45],
                    tooltipAnchor: [0,-46]
                }));
            }
        });
        this.map.dragging.disable();
    }

    endLink(tower){
        if (this.linkingFrom && this.linkingFrom !== tower) {
            if (this.linkingFrom.freq === tower.freq) {
                const link = new Link(this.linkingFrom, tower, this.map);
                this.links.push(link);
                console.log(this.links);
                this.suppressNextClick = true;
            }
        }

        this.cancelLinking();
    }

    cancelLinking() {
        this.linkingFrom = null;
        if (this.previewLine) {
            this.previewLine.remove();
            this.previewLine = null;
            this.suppressNextClick = true;
        }
        this.towers.forEach(t => {
            t.marker.setIcon(Tower.towerIcon);
        });
        this.map.dragging.enable();
    }

    handleMouseMove(e){
        if (!this.linkingFrom) return;

        if (this.previewLine) this.previewLine.remove();

        const startLL = this.linkingFrom.marker && this.linkingFrom.marker.getLatLng()
            ? this.linkingFrom.marker.getLatLng()
            : L.latLng(this.linkingFrom.lat, this.linkingFrom.lng);

        this.previewLine = L.polyline(
            [startLL, e.latlng],
            { dashArray: '4,6' }
        ).addTo(this.map);
    }

    handleClick(e){
        if(this.suppressNextClick){
            this.suppressNextClick = false;
            return;
        }
        if(this.linkingFrom){return}
        const modal = this.modal
        if(modal.isModalVisible) {
            modal.closeModal();
            return;
        }

        const tower = new Tower({
            id: new Date().getTime(),
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            freq: 50,
            map: this.map,
            e: e,
            towers: this.towers,
            context: this,
        })

        modal.showConfigModal(tower);
    }
}

new Map()