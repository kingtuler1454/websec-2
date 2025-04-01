namespace Server.Domain.Entities;

public class Star
{
    private static readonly Random Random = new();
    public float X { get; set; } = Random.Next(25, 500);
    public float Y { get; set; } = Random.Next(25, 400);
    public float Hitbox { get; set; } = 15f;
}
