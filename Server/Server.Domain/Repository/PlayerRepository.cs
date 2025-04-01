using Server.Domain.Entities;
namespace Server.Domain.Repository;

public class PlayerRepository
{
    public List<Player> Players { get; set; } = [];

    public void Add(Player player) => Players.Add(player);

    public List<Player> GetAll() => Players;

    public List<Player> GetTopPlayers()
    {
        return [.. GetAll().OrderByDescending(p => p.CountStar).Take(10)];
    }

    public Player? GetById(string id) => GetAll().FirstOrDefault(p => p.Id == id);

    public void IncrementStarCount(string id)
    {
        var player = GetById(id);
        if (player != null)
        {
            player.CountStar += 1;
        }
    }
}
