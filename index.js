const map = L.map('map');
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const defaultCoords = [19.0760, 72.8777]; // Mumbai
const defaultZoom = 13;
const towers = {};
const links = [];
let tempLine = null;
let selectedTowerId = null;
let isDraggingForLink = false;


map.setView(defaultCoords, defaultZoom);


const towerIcon = L.icon({
    iconUrl: "img.png",
    iconSize: [45, 45],
});


const showConfigModal = (e, id, type) => {
    const configModal = document.querySelector('.config-modal');
    configModal.classList.remove("hide");
    console.log("type",type )
    const lat = configModal.querySelector('#lat');
    const lng = configModal.querySelector('#lng');
    lat.textContent = e.latlng.lat.toFixed(2);
    lng.textContent = e.latlng.lng.toFixed(2);

    const freqInput = document.getElementById('freq');
    const saveBtn = document.querySelector('#save');
    const deleteBtn = document.querySelector('#delete');

    saveBtn.onclick = () => {
        towers[id].freq = Number(freqInput.value);
        const m = towers[id].marker;
        m.setTooltipContent(`
            Freq: ${towers[id].freq} Hz<br/>
            Lat: ${m.getLatLng().lat.toFixed(5)}
            Lng: ${m.getLatLng().lng.toFixed(5)}`
        );
        closeModal();
    }

    deleteBtn.onclick = () => {
        towers[id].remove();
        delete towers[id];
        closeModal();
    }
}

const closeModal = (e) => {
    const configModal = document.querySelector('.config-modal');
    configModal.classList.add("hide");
}

map.on('click', (e) => {
    const configModal = document.querySelector('.config-modal');
    if(!configModal.classList.contains('hide')) {
        closeModal();
        return;
    }

    if (isDraggingForLink) {
        isDraggingForLink = false; // reset and ignore
        return;
    }

    const id = new Date().getTime();
    const marker = L.marker(e.latlng, {icon: towerIcon}).addTo(map);

    towers[id] = {
        marker,
        id: id,
        freq: 50,
        remove: () => {
            map.removeLayer(marker);
        }
    };

    marker.bindTooltip(
        ` Freq: ${towers[id].freq} Hz <br/>
        Lat: ${e.latlng.lat.toFixed(5)}
        Lng: ${e.latlng.lng.toFixed(5)}`,
        {
            permanent: true,
            direction: 'top',
            offset: [0, -10],
            className: 'tower-label'
        }
    ).openTooltip();

    marker.on('mousedown', () => {
        selectedTowerId = id; // start tower
        map.dragging.disable();
    });

    marker.on('mouseup', () => {
        if (selectedTowerId && selectedTowerId !== id) {
            const startMarker = towers[selectedTowerId].marker;
            const endMarker = marker;

            // finalize the line
            const line = L.polyline([startMarker.getLatLng(), endMarker.getLatLng()], {
                color: 'blue',
                weight: 3
            }).addTo(map);

            links.push({
                from: selectedTowerId,
                to: id,
                line
            });
        }

        // cleanup preview line
        if (tempLine) {
            tempLine.remove();
            tempLine = null;
        }
        selectedTowerId = null;
        isDraggingForLink = false;
    });

    marker.on('click', (e) => {
        // If drag occurred, don't open config
        if (isDraggingForLink) return;

        // Open the modal for editing this tower
        showConfigModal(
            { latlng: marker.getLatLng() },  // pass location
            id,
            "edit"
        );
    });

    showConfigModal(e, id, "create");
    console.log(towers);
});

map.on('mousemove', (e) => {
    if (!selectedTowerId) return;

    isDraggingForLink = true; // now we know this was a drag, not a click

    const startMarker = towers[selectedTowerId].marker;

    if (tempLine) tempLine.remove();

    tempLine = L.polyline([startMarker.getLatLng(), e.latlng], { dashArray: '4,6' }).addTo(map);
});

map.on('mouseup', () => {
    if (tempLine) {
        tempLine.remove();
        tempLine = null;
    }
    selectedTowerId = null;
    map.dragging.enable();
});
