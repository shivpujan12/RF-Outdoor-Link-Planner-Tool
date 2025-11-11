class Config {
    static bindTooltipConfig = {
        permanent: true,
        direction: 'top',
        offset: [0, -10],
        className: 'tower-label'
    }

    static getBindTooltipFormattedText(lat,lng,freq) {
        return `Freq: ${freq} Hz <br/>
                Lat: ${lat}
                Lng: ${lng}`
    }

    static ModalTypeConfig = {
        UPDATE: 'update',
        CREATE: 'create'
    }

    static info = `
                <b>How to Use:</b><br>
                1. Click to place a tower<br>
                2. Click a tower to edit<br>
                3. Drag from one tower to another to link<br>
                4. Links only allowed between same frequency<br>
                5. Click on the link to see fresnel Zone and click again to disable it<br>
                6. Delete any one tower to delete the link <br>
            `

    static RED_TOWER_IMAGE = "imgs/redTower.png";
    static TOWER_IMAGE = "imgs/img.png";
}