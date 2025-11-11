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
}