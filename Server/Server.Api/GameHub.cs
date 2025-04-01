using Microsoft.AspNetCore.SignalR;

namespace Server.Api;

public class GameHub(GameRoom gameRoom) : Hub
{
    public async Task RegisterPlayer(string name)
    {
        await gameRoom.RegisterPlayer(Context.ConnectionId, name);
    }

    public async Task CheckGame()
    {
        await gameRoom.CheckGame();
    }

    public void Move(List<string> directions)
    {
        gameRoom.MovePlayer(Context.ConnectionId, directions);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await gameRoom.RemovePlayer(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task LeaveGame()
    {
        await gameRoom.RemovePlayer(Context.ConnectionId);
    }
}
