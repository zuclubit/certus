#r "nuget: BCrypt.Net-Next, 4.0.3"
#r "nuget: Npgsql, 8.0.3"

using System;
using BCrypt.Net;
using Npgsql;

var connectionString = "Host=psql-certus-dev.postgres.database.azure.com;Database=certus;Username=Oscar Valois;SSL Mode=Require;Trust Server Certificate=true";

var email = "admin@hergon.digital";
var newPassword = "e$52io40#001";
var passwordHash = BCrypt.Net.BCrypt.HashPassword(newPassword, 11);

Console.WriteLine($"New hash: {passwordHash}");

using var conn = new NpgsqlConnection(connectionString);
await conn.OpenAsync();

using var cmd = new NpgsqlCommand(@"UPDATE users SET ""PasswordHash"" = @hash WHERE ""Email"" = @email", conn);
cmd.Parameters.AddWithValue("hash", passwordHash);
cmd.Parameters.AddWithValue("email", email);

var affected = await cmd.ExecuteNonQueryAsync();
Console.WriteLine($"Updated {affected} user(s)");
