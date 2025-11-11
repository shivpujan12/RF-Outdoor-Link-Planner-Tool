class Modal {
    configModal = document.querySelector('.config-modal');
    latEl = this.configModal.querySelector('#lat');
    lngEl = this.configModal.querySelector('#lng');
    freqInput = document.querySelector('#freq');
    saveBtn = document.querySelector('#save');
    deleteBtn = document.querySelector('#delete');
    closeBtn = document.querySelector('.close-button');

    isModalVisible = false;

    constructor() {
        this.closeBtn.addEventListener('click', this.closeModal);
    }

    showModal() {
        this.isModalVisible = true;
        this.configModal.classList.remove("hide");
    }

    closeModal = () => {
        this.isModalVisible = false;
        this.configModal.classList.add("hide");
        this.freqInput.value = "";
    }

    showConfigModal(tower,type=Config.ModalTypeConfig.CREATE) {
        if(this.isModalVisible) {
            return;
        }

        this.latEl.textContent = tower.lat.toFixed(2);
        this.lngEl.textContent = tower.lng.toFixed(2);
        this.freqInput.value = tower.freq;

        this.saveBtn.onclick = () => {

            if(type===Config.ModalTypeConfig.UPDATE) {
                tower.update(Number(this.freqInput.value));
                this.closeModal();
                return;
            }

            tower.freq = Number(this.freqInput.value) || 0;
            tower.save();
            this.closeModal();
        }

        this.deleteBtn.onclick = () => {
            tower.delete();
            this.closeModal();
        }

        this.showModal();
    }
}