using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Toolbelt.Blazor.FileDropZone;

public partial class FileDropZone : IAsyncDisposable
{
    [Inject] private IJSRuntime JS { get; init; } = null!;

    [Parameter] public RenderFragment ChildContent { get; set; } = null!;

    private IJSObjectReference? _FileDropZoneHandler;

    private ElementReference _DropZoneElement;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;

        var scriptPath = "./_content/Toolbelt.Blazor.FileDropZone/script.min.js";
        try
        {
            var isOnLine = await this.JS.InvokeAsync<bool>("Toolbelt.Blazor.getProperty", "navigator.onLine");
            if (isOnLine) scriptPath += "?v=" + VersionInfo.VersionText;
        }
        catch (JSException) { }

        await using var module = await this.JS.InvokeAsync<IJSObjectReference>("import", scriptPath);

        this._FileDropZoneHandler = await module.InvokeAsync<IJSObjectReference>(
            "initializeFileDropZone",
            this._DropZoneElement);
    }

    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);
        try
        {
            if (this._FileDropZoneHandler != null)
            {
                await this._FileDropZoneHandler.InvokeVoidAsync("dispose");
                await this._FileDropZoneHandler.DisposeAsync();
            }
        }
        catch (JSDisconnectedException) { }
    }
}
