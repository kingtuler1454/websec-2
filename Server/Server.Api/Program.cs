using Microsoft.AspNetCore.SignalR;
using Server.Api.Services;
using Server.Domain.Repository;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Cors", builder =>
    {
        builder.AllowAnyMethod().AllowAnyHeader().AllowCredentials().SetIsOriginAllowed(_ => true);
    });
});

builder.Services.AddSignalR();
builder.Services.AddSingleton<PlayerRepository>();
builder.Services.AddSingleton<PlayerService>();

var app = builder.Build();

app.UseCors("Cors");
app.MapHub<Hub>("/game");

app.Run();
