using Server.Domain.Entities;
using Server.Domain.Repository;
namespace Server.Api.Services;

public class PlayerService(PlayerRepository repository)
{
    public List<Player> GetPlayers() => repository.GetAll();

    public void AddPlayer(Player player) => repository.Add(player);

    public List<Player> GetTopPlayers() => repository.GetTopPlayers();

    public void IncrementStarCount(string id) => repository.IncrementStarCount(id);
}
