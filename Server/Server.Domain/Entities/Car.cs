namespace Server.Domain.Entities;

public class Car
{
    public required string Id { get; set; }
    public required float X { get; set; }
    public required float Y { get; set; }
    public float SpeedX { get; set; } = 0;
    public float SpeedY { get; set; } = 0;
    public required int Color { get; set; }
    public float Hitbox { get; set; } = 35f;
}
