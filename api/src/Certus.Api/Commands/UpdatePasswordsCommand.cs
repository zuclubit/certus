using Certus.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Certus.Api.Commands;

/// <summary>
/// Command to update all seed user passwords
/// </summary>
public static class UpdatePasswordsCommand
{
    public static async Task ExecuteAsync(ApplicationDbContext context)
    {
        Console.WriteLine("Updating user passwords...");

        // Generate new hash for Admin123!
        var newHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", 11);
        Console.WriteLine($"New hash: {newHash.Substring(0, 30)}...");

        var users = await context.Users
            .Where(u => u.Email.EndsWith("@certus.mx") || u.Email.EndsWith("@hergon.digital"))
            .ToListAsync();

        foreach (var user in users)
        {
            // Use raw SQL to update since PasswordHash has private setter
            await context.Database.ExecuteSqlRawAsync(
                "UPDATE users SET \"PasswordHash\" = {0}, \"FailedLoginAttempts\" = 0, \"LockoutEnd\" = NULL WHERE \"Id\" = {1}",
                newHash, user.Id);
            Console.WriteLine($"Updated password for: {user.Email}");
        }

        Console.WriteLine("Password update complete!");
    }
}
