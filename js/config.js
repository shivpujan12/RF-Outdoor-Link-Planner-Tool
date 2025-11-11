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
                • Click to place a tower<br>
                • Click a tower to edit<br>
                • Drag from one tower to another to link<br>
                • Links only allowed between same frequency
            `

    static RED_TOWER_IMAGE = "imgs/redTower.png";
    static TOWER_IMAGE = "imgs/img.png";
}