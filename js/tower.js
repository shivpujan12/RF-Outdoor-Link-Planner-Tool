class Tower {

    modal = new Modal();

    static towerIcon = L.icon({
        iconUrl: Config.TOWER_IMAGE,
        iconSize: [45, 45],
        iconAnchor: [22, 45],
        tooltipAnchor: [0, -46]
    });

    constructor(data) {
        this.data = data || {};
        this.freq = data.freq || 50;
        this.lat = data.lat || 0;
        this.lng = data.lng || 0;
        this.id = data.id;
        this.map = data.map;
        this.towers = data.towers || [];
    }

    update(freq) {
        this.delete();
        this.freq = Number(freq);
        this.save();
        console.log(this.towers);
    }

    delete(){
        if (this.data.context && this.data.context.links) {
            const mapContext = this.data.context;
            mapContext.links = mapContext.links.filter(link => {
                const shouldRemove = link.startTower === this || link.endTower === this;
                if (shouldRemove) {
                    link.remove();
                }
                return !shouldRemove;
            });
        }

        this.towers = this.towers.filter(tower => {
            return tower.id !== this.id;
        });

        this.map.removeLayer(this.marker);
        console.log(this.towers);
    }

    save(){
        const {e,map} = this.data || {};
        this.marker = L.marker(e.latlng, {icon: Tower.towerIcon}).addTo(map);
        this.marker.bindTooltip(
            Config.getBindTooltipFormattedText(this.lat.toFixed(2),this.lng.toFixed(2),this.freq),
            Config.bindTooltipConfig
        ).openTooltip();

        this.towers.push(this);

        this.marker.on('click', (e) => {
            if (this.data.context && this.data.context.linkingFrom) {
                L.DomEvent.stop(e);
                return;
            }
            if (this.data.context && this.data.context.suppressNextClick) {
                this.data.context.suppressNextClick = false;
                return;
            }
            this.handleTowerClick();
        });

        this.marker.on('mousedown', (e) => {
            L.DomEvent.stopPropagation(e);
            this.data.context.startLink(this);

            this.towers.forEach(t => {
                if (t.freq !== this.freq) {
                    t.marker.setIcon(L.icon({
                        iconUrl: Config.RED_TOWER_IMAGE,
                        iconSize: [45,45],
                        iconAnchor: [22,45],
                        tooltipAnchor: [0,-46]
                    }));
                }
            });
        });

        this.marker.on('mouseup', (e) => {
            L.DomEvent.stop(e);
            this.data.context.endLink(this);
        });

        console.log(this.towers);
    }

    handleTowerClick(){
        if (this.data.context && this.data.context.linkingFrom) return;
        this.modal.showConfigModal(this,Config.ModalTypeConfig.UPDATE);
    }
}

class Link {
    constructor(startTower,endTower,map) {
        this.startTower = startTower;
        this.endTower = endTower;
        this.map = map;

        const s = (startTower.marker && startTower.marker.getLatLng())
            ? startTower.marker.getLatLng()
            : L.latLng(startTower.lat, startTower.lng);
        const e = (endTower.marker && endTower.marker.getLatLng())
            ? endTower.marker.getLatLng()
            : L.latLng(endTower.lat, endTower.lng);

        this.line = L.polyline(
            [s, e],
            { color: 'blue', weight: 3 }
        ).addTo(map);
        this.line.on('click', (e) => {
            L.DomEvent.stop(e);
            if (this.startTower && this.startTower.data && this.startTower.data.context) {
                this.startTower.data.context.suppressNextClick = true;
            }
            this.onLinkClick();
        });
        this.line.on('mousedown', (e) => { L.DomEvent.stop(e); });
    }

    async onLinkClick(){
        console.log("Link clicked");
    }

    remove() {
        if (this.line) {
            this.map.removeLayer(this.line);
        }
    }
}
