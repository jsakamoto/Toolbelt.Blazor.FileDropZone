using System;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Toolbelt.Blazor.FileDropZone
{
    public partial class FileDropZone : IAsyncDisposable
    {
        [Inject] private IJSRuntime JS { get; init; } = null!;

        [Parameter] public RenderFragment ChildContent { get; set; } = null!;

        private IJSObjectReference? _JSModule;

        private IJSObjectReference? _FileDropZoneHandler;

        private ElementReference _DropZoneElement;

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            await base.OnAfterRenderAsync(firstRender);
            if (firstRender)
            {
                var assembly = this.GetType().Assembly;
                var version = assembly
                    .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
                    .InformationalVersion ?? assembly.GetName().Version?.ToString() ?? "";
                this._JSModule = await this.JS.InvokeAsync<IJSObjectReference>(
                    "import",
                    $"./_content/Toolbelt.Blazor.FileDropZone/script.min.js?v={version}");

                this._FileDropZoneHandler = await this._JSModule.InvokeAsync<IJSObjectReference>(
                    "initializeFileDropZone",
                    this._DropZoneElement);
            }
        }

        public async ValueTask DisposeAsync()
        {
            GC.SuppressFinalize(this);
            if (this._FileDropZoneHandler != null)
            {
                await this._FileDropZoneHandler.InvokeVoidAsync("dispose");
                await this._FileDropZoneHandler.DisposeAsync();
            }
            if (this._JSModule != null) await this._JSModule.DisposeAsync();
        }
    }
}
