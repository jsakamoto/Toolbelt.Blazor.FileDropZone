export function initializeFileDropZone(dropZoneElement) {
    return new FileDropZoneHandler(dropZoneElement);
}
const hover = 'hover';
class FileDropZoneHandler {
    constructor(dropZone) {
        this._disposed = false;
        this._dropZone = null;
        this._dropZone = dropZone;
        this._handlers = [
            ['dragenter', this.onDragHover.bind(this)],
            ['dragover', this.onDragHover.bind(this)],
            ['dragleave', this.onDragLeave.bind(this)],
            ['drop', this.onDrop.bind(this)],
            ['paste', this.onPaste.bind(this)]
        ];
        this._handlers.forEach(handler => dropZone.addEventListener(handler[0], handler[1]));
    }
    onDragHover(e) {
        var _a;
        e.preventDefault();
        (_a = this._dropZone) === null || _a === void 0 ? void 0 : _a.classList.add(hover);
    }
    onDragLeave(e) {
        var _a;
        e.preventDefault();
        (_a = this._dropZone) === null || _a === void 0 ? void 0 : _a.classList.remove(hover);
    }
    onDrop(e) {
        var _a;
        e.preventDefault();
        (_a = this._dropZone) === null || _a === void 0 ? void 0 : _a.classList.remove(hover);
        this.dispatch(e.dataTransfer);
    }
    onPaste(e) {
        this.dispatch(e.clipboardData);
    }
    dispatch(dataTransfer) {
        var _a;
        if (dataTransfer === null)
            return;
        if (this._disposed === true)
            return;
        if (document.contains(this._dropZone) === false)
            return;
        const inputFileElement = (_a = this._dropZone) === null || _a === void 0 ? void 0 : _a.querySelector('input[type=file]');
        if (inputFileElement === null)
            throw new Error('');
        inputFileElement.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        inputFileElement.dispatchEvent(event);
    }
    dispose() {
        if (this._disposed === true)
            return;
        if (this._dropZone !== null) {
            this._handlers.forEach(handler => this._dropZone.removeEventListener(handler[0], handler[1]));
        }
        this._disposed = true;
        this._dropZone = null;
    }
}
