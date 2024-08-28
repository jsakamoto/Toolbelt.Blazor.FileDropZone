export const initializeFileDropZone = (dropZoneElement: HTMLElement | null): { dispose: () => void } => {

    const hover = 'hover';
    const state = { t: -1 };

    const preventDefault = (e: Event): void => e.preventDefault();
    const removeHoverClass = (): void => dropZoneElement?.classList.remove(hover);

    const cancelDelay = (): void => {
        if (state.t !== -1) clearTimeout(state.t);
        state.t = -1;
    }

    const onDragHover = (e: DragEvent): void => {
        preventDefault(e);
        cancelDelay();
        dropZoneElement?.classList.add(hover);
    }

    const onDragLeave = (e: DragEvent): void => {
        preventDefault(e);
        cancelDelay();
        state.t = setTimeout(() => {
            state.t = -1;
            removeHoverClass();
        }, 10);
    }

    const dispatch = (dataTransfer: DataTransfer | null): void => {
        if (dataTransfer === null) return;
        if (document.contains(dropZoneElement) === false) return;

        const inputFileElement = dropZoneElement?.querySelector('input[type=file]') as HTMLInputElement | null;
        if (inputFileElement === null) return;

        inputFileElement.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        inputFileElement.dispatchEvent(event);
    }

    // Handle the paste and drop events
    const onDrop = (e: DragEvent): void => {
        e.stopPropagation();
        preventDefault(e);
        cancelDelay();
        removeHoverClass();

        // Set the files property of the input element and raise the change event
        dispatch(e.dataTransfer);
    }

    const onPaste = (e: ClipboardEvent): void => {
        // Set the files property of the input element and raise the change event
        dispatch(e.clipboardData);
    }

    const handlers: ([string, (e: any) => void])[] = [
        ['dragenter', onDragHover],
        ['dragover', onDragHover],
        ['dragleave', onDragLeave],
        ['drop', onDrop],
        ['paste', onPaste]
    ];
    handlers.forEach(handler => dropZoneElement?.addEventListener(handler[0], handler[1]));

    return {
        dispose: () => {
            handlers.forEach(handler => dropZoneElement?.removeEventListener(handler[0], handler[1]));
        }
    };
}
