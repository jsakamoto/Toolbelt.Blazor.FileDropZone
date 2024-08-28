export const initializeFileDropZone = (dropZoneElement) => {
    const hover = 'hover';
    const state = { t: -1 };
    const preventDefault = (e) => e.preventDefault();
    const removeHoverClass = () => dropZoneElement?.classList.remove(hover);
    const cancelDelay = () => {
        if (state.t !== -1)
            clearTimeout(state.t);
        state.t = -1;
    };
    const onDragHover = (e) => {
        preventDefault(e);
        cancelDelay();
        dropZoneElement?.classList.add(hover);
    };
    const onDragLeave = (e) => {
        preventDefault(e);
        cancelDelay();
        state.t = setTimeout(() => {
            state.t = -1;
            removeHoverClass();
        }, 10);
    };
    const dispatch = (dataTransfer) => {
        if (dataTransfer === null)
            return;
        if (document.contains(dropZoneElement) === false)
            return;
        const inputFileElement = dropZoneElement?.querySelector('input[type=file]');
        if (inputFileElement === null)
            return;
        inputFileElement.files = dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        inputFileElement.dispatchEvent(event);
    };
    const onDrop = (e) => {
        e.stopPropagation();
        preventDefault(e);
        cancelDelay();
        removeHoverClass();
        dispatch(e.dataTransfer);
    };
    const onPaste = (e) => {
        dispatch(e.clipboardData);
    };
    const handlers = [
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
};
