using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Toolbelt.Blazor.FileDropZone;

public partial class FileDropZone : IAsyncDisposable
{
    [Inject] private IJSRuntime JS { get; init; } = null!;

    [Parameter] public RenderFragment ChildContent { get; set; } = null!;

    private IJSObjectReference? _FileDropZoneHandler;

    private ElementReference _DropZoneElement;

    private static bool CacheBustingEnabled() => Environment.GetEnvironmentVariable("TOOLBELT_BLAZOR_FILEDROPZONE_JSCACHEBUSTING") != "0";

#if NET10_0_OR_GREATER
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;

        var cacheBustingQueryAsync = CacheBustingEnabled() ?
            this.JS.GetValueAsync<bool>("navigator.onLine").AsTask().ContinueWith(static task => task.Result ? "?v=" + VersionInfo.VersionText : "") :
            Task.FromResult("");

        var module = await cacheBustingQueryAsync
            .ContinueWith(task => this.JS.InvokeAsync<IJSObjectReference>("import", "./_content/Toolbelt.Blazor.FileDropZone/script.min.js" + task.Result).AsTask())
            .Unwrap();

        this._FileDropZoneHandler = await RunAndDisposeAsync(
            module,
            js => js.InvokeAsync<IJSObjectReference?>("initializeFileDropZone", this._DropZoneElement),
            default);
    }
#else
    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;

        var scriptPath = "./_content/Toolbelt.Blazor.FileDropZone/script.min.js";
        var isOnLine = await RunAsync(this.JS, js => js.InvokeAsync<bool>("Toolbelt.Blazor.getProperty", "navigator.onLine"), false);
        if (isOnLine) scriptPath += "?v=" + VersionInfo.VersionText;

        var module = await RunAsync(this.JS, js => js.InvokeAsync<IJSObjectReference?>("import", scriptPath), default);

        this._FileDropZoneHandler = await RunAndDisposeAsync(
            module,
            js => js.InvokeAsync<IJSObjectReference?>("initializeFileDropZone", this._DropZoneElement),
            default);
    }
#endif

    public async ValueTask DisposeAsync()
    {
        GC.SuppressFinalize(this);
        await RunAndDisposeAsync(
            this._FileDropZoneHandler,
            js => js.InvokeAsync<object?>("dispose"),
            default);
    }

    private static async ValueTask<TResult> RunAsync<TJSObject, TResult>(TJSObject? jSObject, Func<TJSObject, ValueTask<TResult>> action, TResult defaultValue)
    {
        if (jSObject == null) return defaultValue;
        try
        {
            return await action.Invoke(jSObject);
        }
        catch (JSException) { return defaultValue; }
        catch (JSDisconnectedException) { return defaultValue; }
    }

    private static async ValueTask<TResult> RunAndDisposeAsync<TJSObject, TResult>(TJSObject? jSObject, Func<TJSObject, ValueTask<TResult>> action, TResult defaultValue) where TJSObject : IAsyncDisposable
    {
        var result = await RunAsync(jSObject, action, defaultValue);
        await RunAsync(jSObject, async js =>
        {
            await js.DisposeAsync();
            return defaultValue;
        }, defaultValue);
        return result;
    }
}
