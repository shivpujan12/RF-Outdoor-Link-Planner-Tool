const map = L.map('map');
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const defaultCoords = [19.0760, 72.8777]; // Mumbai
const defaultZoom = 13;
const towers = {};


map.setView(defaultCoords, defaultZoom);


const towerIcon = L.icon({
    iconUrl: "img.png",
    iconSize: [45, 45],
});


const showConfigModal = (e, id, type) => {
    const configModal = document.querySelector('.config-modal');
    configModal.classList.remove("hide");

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

    showConfigModal(e, id, "create");
    console.log(towers);
});
