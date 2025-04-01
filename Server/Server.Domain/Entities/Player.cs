namespace Server.Domain.Entities;

public class Player
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public int CountStar { get; set; } = 0;
    public required Car Car { get; set; }
}
