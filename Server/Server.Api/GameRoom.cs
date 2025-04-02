using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using Server.Domain.Entities;
using Server.Api.Services;
namespace Server.Api;

public class GameRoom
{
    private static readonly ConcurrentDictionary<string, Player> Players = new();
    private static Star Star = new();
    private static readonly double GameLoopInterval = 1000 / 60;
    private readonly IHubContext<GameHub> _hubContext;
    private readonly System.Timers.Timer _gameLoopTimer;
    private readonly PlayerService _service;

    public GameRoom(IHubContext<GameHub> hubContext, PlayerService service)
    {
        _service = service;
        _hubContext = hubContext;
        _gameLoopTimer = new System.Timers.Timer(GameLoopInterval);
        _gameLoopTimer.Elapsed += async (sender, e) => await UpdateGame();
        _gameLoopTimer.Start();
    }

    public async Task CheckGame()
    {
        var topPlayers = _service.GetTopPlayers();
        await _hubContext.Clients.All.SendAsync("StarCollected", Star);
        await _hubContext.Clients.All.SendAsync("TopPlayers", topPlayers);
    }

    public async Task RegisterPlayer(string connectionId, string name)
    {
        if (Players.Count >= 10)
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("Info", "full");
            return;
        }
        else
        {
            await _hubContext.Clients.Client(connectionId).SendAsync("Info", "empty");
        }

        var car = new Car
        {
            Id = connectionId,
            X = new Random().Next(100, 450),
            Y = new Random().Next(100, 450),
            Color = $"#{new Random().Next(0x1000000):X6}"
        };

        var player = new Player
        {
            Id = connectionId,
            Name = name,
            Car = car
        };
        _service.AddPlayer(player);
        Players[connectionId] = player;
    }

    public void MovePlayer(string connectionId, List<string> directions)
    {
        if (!Players.TryGetValue(connectionId, out var player)) return;

        float acceleration = 0.3f;
        float maxSpeed = 5f;
        float oppositeAcceleration = 1.0f;

        foreach (var direction in directions)
        {
            switch (direction)
            {
                case "up":
                    player.Car.SpeedY -= player.Car.SpeedY > 0 ? oppositeAcceleration : acceleration;
                    break;
                case "down":
                    player.Car.SpeedY += player.Car.SpeedY < 0 ? oppositeAcceleration : acceleration;
                    break;
                case "left":
                    player.Car.SpeedX -= player.Car.SpeedX > 0 ? oppositeAcceleration : acceleration;
                    break;
                case "right":
                    player.Car.SpeedX += player.Car.SpeedX < 0 ? oppositeAcceleration : acceleration;
                    break;
            }
        }

        player.Car.SpeedX = Math.Clamp(player.Car.SpeedX, -maxSpeed, maxSpeed);
        player.Car.SpeedY = Math.Clamp(player.Car.SpeedY, -maxSpeed, maxSpeed);
    }

    public async Task UpdateGame()
    {
        float deceleration = 0.01f;
        float maxSpeed = 5f;

        foreach (var player in Players.Values)
        {
            if (player.Car.SpeedX > 0) player.Car.SpeedX -= deceleration;
            else if (player.Car.SpeedX < 0) player.Car.SpeedX += deceleration;

            if (player.Car.SpeedY > 0) player.Car.SpeedY -= deceleration;
            else if (player.Car.SpeedY < 0) player.Car.SpeedY += deceleration;
            if (Math.Abs(player.Car.SpeedX) < deceleration) player.Car.SpeedX = 0;
            if (Math.Abs(player.Car.SpeedY) < deceleration) player.Car.SpeedY = 0;

            player.Car.SpeedX = Math.Clamp(player.Car.SpeedX, -maxSpeed, maxSpeed);
            player.Car.SpeedY = Math.Clamp(player.Car.SpeedY, -maxSpeed, maxSpeed);

            player.Car.X += player.Car.SpeedX;
            player.Car.Y += player.Car.SpeedY;

            player.Car.X = Math.Clamp(player.Car.X, 0, 600);
            player.Car.Y = Math.Clamp(player.Car.Y, 0, 600);

            if (player.Car.X < Star.X + Star.Hitbox && player.Car.X + player.Car.Hitbox > Star.X - Star.Hitbox &&
                player.Car.Y < Star.Y + Star.Hitbox && player.Car.Y + player.Car.Hitbox > Star.Y - Star.Hitbox)
            {
                Star = new Star();
                await _hubContext.Clients.All.SendAsync("StarCollected", Star);

                _service.IncrementStarCount(player.Id);
                var topPlayers = _service.GetTopPlayers();
                await _hubContext.Clients.All.SendAsync("TopPlayers", topPlayers);
            }

            foreach (var otherPlayer in Players.Values)
            {
                if (otherPlayer.Id != player.Id)
                {
                    if (player.Car.X < otherPlayer.Car.X + otherPlayer.Car.Hitbox && player.Car.X + player.Car.Hitbox > otherPlayer.Car.X &&
                        player.Car.Y < otherPlayer.Car.Y + otherPlayer.Car.Hitbox && player.Car.Y + player.Car.Hitbox > otherPlayer.Car.Y)
                    {
                        float tempVX = player.Car.SpeedX;
                        float tempVY = player.Car.SpeedY;

                        player.Car.SpeedX = otherPlayer.Car.SpeedX;
                        player.Car.SpeedY = otherPlayer.Car.SpeedY;

                        otherPlayer.Car.SpeedX = tempVX;
                        otherPlayer.Car.SpeedY = tempVY;

                        player.Car.X += player.Car.SpeedX;
                        player.Car.Y += player.Car.SpeedY;

                        otherPlayer.Car.X += otherPlayer.Car.SpeedX;
                        otherPlayer.Car.Y += otherPlayer.Car.SpeedY;

                        float overlapX = (player.Car.Hitbox + otherPlayer.Car.Hitbox) / 2 - Math.Abs(player.Car.X - otherPlayer.Car.X);
                        float overlapY = (player.Car.Hitbox + otherPlayer.Car.Hitbox) / 2 - Math.Abs(player.Car.Y - otherPlayer.Car.Y);

                        if (overlapX > 0 && overlapY > 0)
                        {
                            if (overlapX < overlapY)
                            {
                                player.Car.X += overlapX / 2 * Math.Sign(player.Car.X - otherPlayer.Car.X);
                                otherPlayer.Car.X -= overlapX / 2 * Math.Sign(player.Car.X - otherPlayer.Car.X);
                            }
                            else
                            {
                                player.Car.Y += overlapY / 2 * Math.Sign(player.Car.Y - otherPlayer.Car.Y);
                                otherPlayer.Car.Y -= overlapY / 2 * Math.Sign(player.Car.Y - otherPlayer.Car.Y);
                            }
                        }
                    }
                }
            }
        }
        await _hubContext.Clients.All.SendAsync("GameState", Players.Values);
        await _hubContext.Clients.All.SendAsync("StarCollected", Star);
    }

    public async Task RemovePlayer(string connectionId)
    {
        if (Players.TryRemove(connectionId, out _))
        {
            await _hubContext.Clients.All.SendAsync("PlayerLeft", connectionId);
        }
        if (Players.Count < 10) await _hubContext.Clients.All.SendAsync("Info", "empty");
    }
}
