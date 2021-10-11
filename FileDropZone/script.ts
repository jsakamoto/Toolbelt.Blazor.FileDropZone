export function initializeFileDropZone(dropZoneElement: HTMLElement): { dispose: () => void } {
    return new FileDropZoneHandler(dropZoneElement);
}

const hover = 'hover';

class FileDropZoneHandler {

    private _disposed: boolean = false;
    private _dropZone: HTMLElement | null = null;
    private _handlers: any[][];

    constructor(
        dropZone: HTMLElement
    ) {
        this._dropZone = dropZone;
        this._handlers = [
            ['dragenter', this.onDragHover.bind(this)],
            ['dragover', this.onDragHover.bind(this)],
            ['dragleave', this.onDragLeave.bind(this)],
            ['drop', this.onDrop.bind(this)],
            ['paste', this.onPaste.bind(this)]
        ];
        this._handlers.forEach(handler => dropZone.addEventListener(handler[0] as string, handler[1] as any))
    }

    private onDragHover(e: DragEvent): void {
        e.preventDefault();
        this._dropZone?.classList.add(hover);
    }

    private onDragLeave(e: DragEvent): void {
        e.preventDefault();
        this._dropZone?.classList.remove(hover);
    }

    // Handle the paste and drop events
    private onDrop(e: DragEvent): void {
        e.preventDefault();
        this._dropZone?.classList.remove(hover);

        // Set the files property of the input element and raise the change event
        this.dispatch(e.dataTransfer);
    }

    private onPaste(e: ClipboardEvent): void {
        // Set the files property of the input element and raise the change event
        this.dispatch(e.clipboardData);
    }

    private dispatch(dataTransfer: DataTransfer | null): void {
        if (dataTransfer === null) return;
        if (this._disposed === true) return;
        if (document.contains(this._dropZone) === false) return;

        const inputFileElement = this._dropZone?.querySelector('input[type=file]') as HTMLInputElement | null;
        if (inputFileElement === null) throw new Error('');

        inputFileElement.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        inputFileElement.dispatchEvent(event);
    }

    public dispose(): void {
        if (this._disposed === true) return;
        if (this._dropZone !== null) {
            this._handlers.forEach(handler =>
                this._dropZone!.removeEventListener(handler[0] as string, handler[1] as any))
        }
        this._disposed = true;
        this._dropZone = null;
    }
}