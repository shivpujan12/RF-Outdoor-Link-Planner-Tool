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
        const dist = map.distance(s, e).toFixed(2);
        const freqLabel = `${this.startTower.freq} Hz`;
        this.line.bindTooltip(`${freqLabel} | ${dist} m`, {
            permanent: true,
            direction: 'center',
            className: 'link-label'
        }).openTooltip();

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

        if (this.fresnelPolygon) {
            this.map.removeLayer(this.fresnelPolygon);
            this.fresnelPolygon = null;
            return;
        }

        const poly = this.buildFresnelEllipse();
        if (poly) {
            this.fresnelPolygon = poly.addTo(this.map);
            poly.on('click', (e) => {
                this.map.removeLayer(this.fresnelPolygon);
                this.fresnelPolygon = null;})
        }
    }

    remove() {
        if (this.line) {
            this.map.removeLayer(this.line);
        }
    }

    _bearingRad(from, to){
        const φ1 = from.lat * Math.PI/180;
        const φ2 = to.lat * Math.PI/180;
        const Δλ = (to.lng - from.lng) * Math.PI/180;
        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
        return Math.atan2(y, x);
    }

    buildFresnelEllipse(){
        const start = this.startTower.marker ? this.startTower.marker.getLatLng() : L.latLng(this.startTower.lat, this.startTower.lng);
        const end   = this.endTower.marker   ? this.endTower.marker.getLatLng()   : L.latLng(this.endTower.lat, this.endTower.lng);

        // Link length in meters
        const Lm = this.map.distance(start, end);
        if (!Lm || !isFinite(Lm)) return null;

        // Frequency assumed in MHz on the tower; convert to Hz
        const fHz = this.startTower.freq;
        const c = 3e8;
        const lambda = c / fHz; // meters

        // Midpoint first Fresnel radius r = sqrt(lambda * L / 4)
        const rMid = Math.sqrt(lambda * Lm / 4);

        // Ellipse semi-axes: ensure ellipse endpoints coincide with towers
        const a = Lm / 2;                 // along the link
        const b = Math.min(rMid,a * 0.9);

        // Ellipse center and orientation
        const center = L.latLng((start.lat + end.lat) / 2, (start.lng + end.lng) / 2);
        const bearing = this._bearingRad(start, end);

        // Local meters-to-degrees conversion (approximate)
        const latRad = center.lat * Math.PI/180;
        const metersPerDegLat = 111320;
        const metersPerDegLng = 111320 * Math.cos(latRad);

        // Parametric ellipse, rotated by bearing
        const steps = 64;
        const pts = [];
        for (let i = 0; i < steps; i++) {
            const t = (i / steps) * 2 * Math.PI;
            const x = a * Math.cos(t);
            const y = b * Math.sin(t);
            const xr = x * Math.cos(bearing) - y * Math.sin(bearing);
            const yr = x * Math.sin(bearing) + y * Math.cos(bearing);
            const dLat = yr / metersPerDegLat;
            const dLng = xr / metersPerDegLng;
            pts.push([center.lat + dLat, center.lng + dLng]);
        }
        pts.push(pts[0]);

        return L.polygon(pts, { weight: 1, color: 'purple', dashArray: '4,4', fill: true, fillOpacity: 0.25 });
    }



}
