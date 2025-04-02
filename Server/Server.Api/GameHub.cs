using Microsoft.AspNetCore.SignalR;

namespace Server.Api;

public class GameHub(GameRoom gameRoom) : Hub
{
    public async Task RegisterPlayer(string name)
    {
        try
        {
            await gameRoom.RegisterPlayer(Context.ConnectionId, name);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Ошибка в RegisterPlayer: {ex}");
            throw;
        }
    }

    public async Task CheckGame()
    {
        try
        {
            await gameRoom.CheckGame();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Ошибка в CheckGame: {ex}");
            throw;
        }
    }

    public void Move(List<string> directions)
    {
        try
        {
            gameRoom.MovePlayer(Context.ConnectionId, directions);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Ошибка в Move: {ex}");
            throw;
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            await gameRoom.RemovePlayer(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Ошибка в OnDisconnectedAsync: {ex}");
            throw;
        }
    }

    public async Task LeaveGame()
    {
        try
        {
            await gameRoom.RemovePlayer(Context.ConnectionId);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Ошибка в LeaveGame: {ex}");
            throw;
        }
    }
}
